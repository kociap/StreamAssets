const applicationVariables = require('./applicationVariables.js');
const errorSystem = require("./errorSystem.js");
const GoogleAPIAuthorization = require('./GoogleAPIAuthorization.js');

const yotubeScopes = {
    channels: 'https://www.googleapis.com/youtube/v3/channels',
    subscriptions: 'https://www.googleapis.com/youtube/v3/subscriptions'
}

module.exports = class YoutubeService {
    constructor(requestAuthorizer, channelID) {
        this.requestAuthorizer = requestAuthorizer;
        this.channelID = channelID || null;
    }

    setChannelID(channelID) {
        this.channelID = channelID;
    }

    setRedirectURI(redirectURI) {
        this.requestAuthorizer.setRedirectURI(redirectURI);
    }

    setTokens(tokensData) {
        this.requestAuthorizer.setTokens(tokensData);
    }

    authorizeNewAccess() {
        return new Promise((resolve, reject) => {
            this.requestAuthorizer.authorizeAccesss(applicationVariables.youtubeAPIScope)
            .then(() => {
                resolve();
            }).catch((error) => {
                errorSystem.log(applicationVariables.errorLogFile, "Could not authorize access", errorSystem.stacktrace(error));
                reject(error);
            })
        });
    }

    /**
     * Gets channel id using access token
     * @param {string} accessToken 
     * @returns {Promise<string>}
     */
    static getChannelIDWithToken(accessToken) {
        return GoogleAPIAuthorization.makeRequest(accessToken, {
            method: 'GET',
            api: applicationVariables.youtubeAPIScope, 
            scope: yotubeScopes.channels, 
            params: { 
                key: applicationVariables.youtubeAPIKey, 
                part: 'id', 
                mine: 'true' 
            }
        }).then((response) => {
            return response.items[0].id;
        });
    }

    /**
     * @returns {Promise<string>} Resolves with channel ID
     */
    getChannelID() {
        return new Promise((resolve, reject) => {
            this.requestAuthorizer.makeAuthorizedRequest({
                method: 'GET',
                api: applicationVariables.youtubeAPIScope, 
                scope: yotubeScopes.channels, 
                params: { 
                    key: applicationVariables.youtubeAPIKey, 
                    part: 'id', 
                    mine: 'true' 
                }
            }).then((response) => {
                resolve(response.items[0].id);
            }).catch((error) => {
                reject(error);
            })
        });
    }

    /**
     * @returns {Promise<object>}
     */
    getChannelStatistics() {
        if(!this.channelID) {
            errorSystem.log(applicationVariables.errorLogFile, "Channel ID is not set", errorSystem.stacktrace("Channel ID not set"));
            return Promise.reject("Channel ID not set");
        }

        return new Promise((resolve, reject) => {
            this.requestAuthorizer.makeAuthorizedRequest({
                method: 'GET',
                api: applicationVariables.youtubeAPIScope, 
                scope: yotubeScopes.channels,  
                params: { 
                    key: applicationVariables.youtubeAPIKey, 
                    part: "statistics", 
                    id: this.channelID 
                }
            }).then((response) => {
                resolve(response.items[0].statistics);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * @returns {Promise<Array>}
     */
    getRecentSubscribers() {
        if(!this.channelID) {
            errorSystem.log(applicationVariables.errorLogFile, "Channel ID is not set", errorSystem.stacktrace("Channel ID not set"));
            return Promise.reject("Channel ID not set");
        }

        return new Promise((resolve, reject) => {
            this.requestAuthorizer.makeAuthorizedRequest({
                method: 'GET',
                api: applicationVariables.youtubeAPIScope, 
                scope: yotubeScopes.subscriptions, 
                params: { 
                    key: applicationVariables.youtubeAPIKey, 
                    part: 'subscriberSnippet', 
                    myRecentSubscribers: 'true' 
                }
            }).then((response) => {
                resolve(response.items);
            }).catch((error) => {
                reject(error);
            });
        })
    }
}