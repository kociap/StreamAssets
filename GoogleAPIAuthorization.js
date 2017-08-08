const requestPromise = require('request-promise');
const ApplicationVariables = require('./ApplicationVariables.js');
const TokenData = require('./TokenData.js');
const buildURI = require('./utility.js').buildURI;
const Errors = require('./Errors.js');

/**
 * Class for authorizing access to various google apis
 */
module.exports = class GoogleAPIAuthorization {
    /**
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
                client_id: ApplicationVariables.CLIENT_ID,
                client_secret: ApplicationVariables.CLIENT_SECRET,
                redirect_uri: redirectURI
            }),
            json: true 
        }).then((response) => {
            return new TokenData(response.access_token, response.refresh_token, response.token_type, response.expires_in);
        }).catch((error) => {
            throw new Errors.GoogleAPIAuthorizationError(error);
        });
    }

    /**
     * @private 
     * @param {string} refreshToken Refresh token
     * @returns {Promise<TokenData, Error>} Resolves with new TokenData
     */
    static refreshAccessToken(refreshToken) {
        return requestPromise({
            method: 'POST',
            uri: buildURI('https://www.googleapis.com/oauth2/v4/token', {
                client_id: ApplicationVariables.CLIENT_ID,
                client_secret: ApplicationVariables.CLIENT_SECRET,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            }), 
            json: true 
        }).then((authorizationData) => {
            return new TokenData(authorizationData.access_token, refreshToken, authorizationData.token_type, authorizationData.expires_in);
        }).catch((error) => {
            throw new Errors.RefreshError(error);
        });
    }

    /**
     * Requests data from given api endpoint.
     * Doesn't check request parameters.
     * Automatically appends access_token to request parameters
     * @param {{method: string; accessToken: string; api: string; scope: string; params: object}} requestData
     * @returns {Promise<object>}
     */
    static makeRequest(requestData) {
        requestData.params.access_token = requestData.accessToken;
        return requestPromise({
            method: requestData.method, 
            uri: buildURI(requestData.scope, requestData.params), 
            json: true
        }).catch((error) => {
            throw new Errors.RequestError(error);
        })
    }
}