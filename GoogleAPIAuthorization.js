const opn = require('opn');
const requestPromise = require('request-promise');
const fs = require('fs');
const errorSystem = require('./errorSystem.js');
const applicationVariables = require('./applicationVariables.js');
const TokenData = require('./TokenData.js');
const buildURI = require('./utility.js').buildURI;
const Errors = require('Errors.js');

/**
 * Class for authorizing access to various google apis
 */
module.exports = class GoogleAPIAuthorization {
    constructor() {
        this.redirectURI = null;
        this.tokens = {};
        this.authorizeAccessPromise = null;
        this.codes = {};
    }

    /**
     * Sets tokens this GoogleAPIAuthorization instance will use
     * @param {object} tokens 
     */
    setTokens(tokens) {
        this.tokens = tokens;
    }

    /**
     * @param {TokenData} tokens 
     * @param {string} scope 
     */
    setTokenForScope(tokens, scope) {
        this.tokens[scope] = tokens;
    }

    /**
     * @returns {object} object mapping scope to token data object
     */
    getTokens() {
        return this.tokens;
    }

    /**
     * @param {string} scope 
     * @returns {TokenData}
     */
    getTokensForScope(scope) {
        return this.tokens[scope];
    }

    /**
     * @param {string} redirectURI 
     */
    setRedirectURI(redirectURI) {
        this.redirectURI = encodeURI(redirectURI);
    }

    /**
     * Set authentication code
     * @param {string} code Authentication code
     */
    setCodeForScope(scope, code) {
        this.codes[scope] = code;
    }

    /**
     * @private
     * @param {string} scope 
     * @param {object} tokenData 
     */
    updateTokenInformations(scope, tokenData) {
        this.tokens[scope] = new TokenData(tokenData.access_token, tokenData.refresh_token, tokenData.token_type, tokenData.expires_in);
    }

    /**
     * @private
     * Note: Rebuild it so that it doesn't depend on sockets |
     * Opens a page in the web browser with google's authentication and waits for the user to complete authentication
     * On response from the page it sends authentication-successful or authentication-error 
     * @param {string} scope Single api scope
     * @returns {Promise<string, string>} Resolves with authentication token or error stack if required parameters are not specified
     */
    requestAuthenticationCode(scope) {
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
            // Open authentication page
            // buildURI('https://accounts.google.com/o/oauth2/auth', {
            //     client_id: applicationVariables.clientID,
            //     scope: scope,
            //     redirect_uri: this.redirectURI,
            //     response_type: 'code',
            //     access_type: 'offline'
            // })
        });
    }

    /**
     * 
     * @param {*} code 
     * @param {*} redirectURI 
     * @returns {Promise<TokenData>}
     */
    static exchangeCode(code, redirectURI) {
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
        }).catch((error) => {
            throw new Errors.AuthorizationError(error);
        }).then((response) => {
            return new TokenData(response.access_token, response.refresh_token, response.token_type, response.expires_in);
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
        if (this.tokens[scope].expirationDate >= Date.now() + 1000) {
            // Access token still valid
            // Break the execution because we have working access token
            return Promise.resolve(this.tokens[scope].accessToken);
        }

        return new Promise((resolve, reject) => {
            // Access token has expired, request a new one
            requestPromise({
                method: 'POST',
                uri: buildURI('https://www.googleapis.com/oauth2/v4/token', {
                    client_id: applicationVariables.clientID,
                    client_secret: applicationVariables.clientSecret,
                    refresh_token: this.tokens[scope].refreshToken,
                    grant_type: 'refresh_token'
                }), 
                json: true 
            }).then((authorizationData) => {
                this.updateTokenInformations(scope, authorizationData);
                resolve(authorizationData.access_token);
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, 'Could not refresh access token', errorSystem.stacktrace(error));
                reject(error);
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
            let authenticationCodePromise;
            if(this.codes.hasOwnProperty(scope)) {
                authenticationCodePromise = Promise.resolve(this.codes[scope]);
                delete this.codes[scope];
            } else {
                authenticationCodePromise = this.requestAuthenticationCode(scope);
            }

            authenticationCodePromise.then((authenticationToken) => {
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

        return this.authorizeAccessPromise
            .then((code) => { 
                this.authorizeAccessPromise = null;
                return code;
            }).catch((error) => { 
                this.authorizeAccessPromise = null; 
                throw error; 
            });
    }

    /**
     * Requests data from given api endpoint.
     * Doesn't check request parameters.
     * Automatically appends access_token to request parameters
     * @param {{method: string; api: string; scope: string; params: object}} requestData
     * @returns {Promise<object>}
     */
    makeAuthorizedRequest(requestData) {
        return new Promise((resolve, reject) => {
            this.authorizeAccess(requestData.api)
            .then((accessToken) => {
                requestData.params.access_token = accessToken;
                return requestPromise({
                    method: requestData.method, 
                    uri: buildURI(requestData.scope, requestData.params), 
                    json: true
                }).then((response) => {
                    resolve(response);
                });
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, "Could not make an authorized request", errorSystem.stacktrace(error));
                reject(error);
            });
        });
    }

    /**
     * @param {string} accessToken
     * @param {{method: string; api: string; scope: string; params: object}} requestData
     * @returns {Promise<object>}
     */
    makeRequest(accessToken, requestData) {
        return new Promise((resolve, reject) => {
            requestData.params.access_token = accessToken;
            return requestPromise({
                method: requestData.method, 
                uri: buildURI(requestData.scope, requestData.params), 
                json: true
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, "Request failed", errorSystem.stacktrace(error));
                reject(error);
            });
        });
    }
}