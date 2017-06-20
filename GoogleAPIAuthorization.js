const opn = require('opn');
const requestPromise = require('request-promise');
const fs = require('fs');
const errorSystem = require('./errorSystem.js');
const applicationVariables = require('./applicationVariables.js');

/**
 * Class for authorizing access to various google apis
 */
module.exports = class GoogleAPIAuthorization {
    /**
     * @param {SocketIO.Server} socketio 
     */
    constructor(socketio) {
        this.redirectURI = null;
        this.socketio = socketio;
        this.tokens = {};
        this.authorizeAccessPromise = null;
    }

    /**
     * Sets tokens this GoogleAPIAuthorization instance will use
     * @param {object} tokens 
     */
    setTokens(tokens) {
        this.tokens = tokens;
    }

    /**
     * @returns {object} object mapping scope to token data object
     */
    getTokens() {
        return this.tokens;
    }

    /**
     * @param {string} redirectURI 
     */
    setRedirectURI(redirectURI) {
        this.redirectURI = encodeURI(redirectURI);
    }

    /**
     * @private
     * @param {string} scope 
     * @param {object} tokenData 
     */
    updateTokenInformations(scope, tokenData) {
        if (!this.tokens.hasOwnProperty(scope)) {
            this.tokens[scope] = tokenData;
            this.tokens[scope].expires_in = this.tokens[scope].expires_in * 1000 + Date.now();
        } else {
            this.tokens[scope].expires_in = tokenData.expires_in * 1000 + Date.now();
            this.tokens[scope].access_token = tokenData.access_token;
        }
    }

    /**
     * @private
     * Opens a page in the web browser with google's authentication and waits for the user to complete authentication
     * On response from the page it sends authentication-successful or authentication-error 
     * @param {string} scope Single api scope
     * @returns {Promise<string, string>} Resolves with authentication token or error stack if required parameters are not specified
     */
    getAuthenticationToken(scope) {
        if(!scope || !this.redirectURI) {
            let stacktrace = '';
            if (!scope) {
                stacktrace += errorSystem.stacktrace("Missing parameter scope");
                errorSystem.log(applicationVariables.errorLogFile, "Failed to prepare request uri", errorSystem.stacktrace("Missing parameter scope"));
            }

            if (!this.redirectURI) {
                stacktrace += errorSystem.stacktrace("Missing parameter redirect_uri");
                errorSystem.log(applicationVariables.errorLogFile, "Failed to prepare request uri", errorSystem.stacktrace("Missing parameter redirect_uri"));
            }

            return Promise.reject(stacktrace);
        }

        return new Promise((resolve, reject) => {
            this.socketio.on('connection', (socket) => {
                // Wait for a response from the opened page
                socket.on('authentication-successful', (token) => {
                    resolve(token);
                }).on('authentication-error', (error) => {
                    errorSystem.log(applicationVariables.errorLogFile, "Failed to obtain authentication token", errorSystem.stacktrace(error));
                    reject(error);
                });
            });
            // Open authentication page
            opn(buildURI('https://accounts.google.com/o/oauth2/auth', {
                client_id: applicationVariables.clientID,
                scope: scope,
                redirect_uri: this.redirectURI,
                response_type: 'code',
                access_type: 'offline'
            }));
        });
    }

    /**
     * @private
     * @param {string} code Authentication code
     * @returns {Promise<object, string>} Resolves with 
     */
    exchangeToken(code) {
        if(!code || !this.redirectURI) {
            let stacktrace = '';
            if (!code) {
                stacktrace += errorSystem.stacktrace("Missing parameter code");
                errorSystem.log(applicationVariables.errorLogFile, "Failed to prepare request uri", errorSystem.stacktrace("Missing parameter code"));
            }

            if (!this.redirectURI) {
                stacktrace += errorSystem.stacktrace("Missing parameter redirect_uri");
                errorSystem.log(applicationVariables.errorLogFile, "Failed to prepare request uri", errorSystem.stacktrace("Missing parameter redirect_uri"));
            }

            return Promise.reject(errorMessage);
        }

        return requestPromise({
            method: 'POST',
            uri: buildURI('https://www.googleapis.com/oauth2/v4/token', {
                code: code,
                grant_type: 'authorization_code',
                client_id: applicationVariables.clientID,
                client_secret: applicationVariables.clientSecret,
                redirect_uri: this.redirectURI
            }),
            json: true 
        });
    }

    /**
     * @private 
     * @param {string} scope Scope for which refresh access token
     * @returns {Promise<string, string>} Resolves with access token or rejects with error stack if failed to authorize access
     */
    refreshAccessToken(scope) {
        // Check whether currently owned access token hasn't yet expired
        if (this.tokens[scope].expires_in >= Date.now() + 1000) {
            // Access token still valid
            // Break the execution because we have working access token
            return Promise.resolve(this.tokens[scope].access_token);
        }

        return new Promise((resolve, reject) => {
            // Access token has expired, request a new one
            requestPromise({
                method: 'POST',
                uri: buildURI('https://www.googleapis.com/oauth2/v4/token', {
                    client_id: applicationVariables.clientID,
                    client_secret: applicationVariables.clientSecret,
                    refresh_token: this.tokens[scope].refresh_token,
                    grant_type: 'refresh_token'
                }), 
                json: true 
            }).then((authorizationData) => {
                this.updateTokenInformations(scope, authorizationData);
                resolve(authorizationData.access_token);
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, 'Could not refresh access token', errorSystem.stacktrace(error));

                this.authorizeNewAccessToken(scope)
                .then((accessToken) => {
                    resolve(accessToken);
                }).catch((error) => {
                    errorSystem.log(applicationVariables.errorLogFile, "Failed to authorize new access token", errorSystem.stacktrace(error));
                    reject(error);
                });
            });
        });
    }

    /**
     * @private
     * @param {string} scope
     * @return {Promise<string, string>} Resolves with access token or rejects with error stack
     */
    authorizeNewAccessToken(scope) {
        return new Promise((resolve, reject) => {
            this.getAuthenticationToken(scope)
            .then((authenticationToken) => {
                this.exchangeToken(authenticationToken)
                .then((authorizationData) => {
                    // Inform the page about successful authorization
                    // this.socketio.emit('authorization-successful');
                    this.updateTokenInformations(scope, authorizationData);
                    resolve(authorizationData.access_token);
                }).catch((error) => {
                    // Inform the page about an error
                    // this.socketio.emit('authorization-error', error);
                    errorSystem.log(applicationVariables.errorLogFile, "Failed to exchange tokens", errorSystem.stacktrace(error));
                    reject(error);
                });
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, "Failed to obtain authentication token", errorSystem.stacktrace(error));
                reject(error);
            })
        });
    }

    /**
     * @private
     * @param {string} scope Single api scope
     * @throws when required request parameters are not supplied
     * @returns {Promise<string} resolved when authorization succeeds or rejected when it fails
     */
    authorizeAccess(scope) {
        if(this.authorizeAccessPromise) {
            // If is already authorizing access, return authorization promise
            return this.authorizeAccessPromise;
        }

        if (this.tokens.hasOwnProperty(scope)) {
            this.authorizeAccessPromise = this.refreshAccessToken(scope);
        } else {
            this.authorizeAccessPromise = this.authorizeNewAccessToken(scope);
        }

        return this.authorizeAccessPromise.then(() => { this.authorizeAccessPromise = null; }).catch(() => { this.authorizeAccessPromise = null; });
    }

    /**
     * Requests data from given api endpoint.
     * Doesn't check request parameters.
     * Automatically appends access_token to request parameters
     * @param {string} method Request method
     * @param {string} api API scope
     * @param {string} scope API endpoint
     * @param {object} params Request parameters
     * @returns {Promise<object>}
     */
    makeAuthorizedRequest(method, api, scope, params) {
        return new Promise((resolve, reject) => {
            this.authorizeAccess(api)
            .then((accessToken) => {
                params.access_token = accessToken;
                return requestPromise({
                    method: method, 
                    uri: buildURI(scope, params), 
                    json: true
                }).then((response) => {
                    resolve(response);
                });
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, "Error: Could not make an authorized request", errorSystem.stacktrace(error));
                reject(error);
            });
        });

    }
}

/**
 * Builds uri with given base request uri and parameters
 * @param {string} requestURI 
 * @param {object} params 
 * @returns {string}
 */
function buildURI(requestURI, params) {
    let requestParams = [];
    for(let key of Object.keys(params)) {
        requestParams.push(`${key}=${params[key]}`);
    }
    return requestURI + '?' + requestParams.join('&');
}