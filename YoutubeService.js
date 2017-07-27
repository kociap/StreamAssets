const ApplicationVariables = require('./ApplicationVariables.js');
const errorSystem = require("./errorSystem.js");
const GoogleAPIAuthorization = require('./GoogleAPIAuthorization.js');
const Errors = require('./Errors.js');

const YotubeScopes = {
    CHANNELS: 'https://www.googleapis.com/youtube/v3/channels',
    SUBSCRIPTIONS: 'https://www.googleapis.com/youtube/v3/subscriptions'
}

module.exports = class YoutubeService {
    constructor(channelID, tokenData) {
        if(!channelID) {
            throw new Errors.RequiredArgumentNotSupplied('channelID');
        }
        if(!tokenData) {
            throw new Errors.RequiredArgumentNotSupplied('tokenData');
        }

        this.tokenData = tokenData;
        this.channelID = channelID;
    }

    static authorizeAccessCode(code) {
        return GoogleAPIAuthorization.exchangeCode(code, ApplicationVariables.YOUTUBE_OAUTH_REDIRECT_URI);
    }

    /**
     * Gets channel id using access token
     * @param {string} accessToken 
     * @returns {Promise<string>}
     */
    static getChannelIDWithToken(accessToken) {
        return GoogleAPIAuthorization.makeRequest({
            method: 'GET',
            accessToken: accessToken,
            api: ApplicationVariables.YOUTUBE_API_SCOPE, 
            scope: YotubeScopes.CHANNELS, 
            params: { 
                key: ApplicationVariables.YOUTUBE_API_KEY, 
                part: 'id', 
                mine: 'true' 
            }
        }).then((response) => {
            return response.items[0].id;
        }).catch((error) => {
            throw new Errors.RequestError(error);
        });
    }

    /**
     * @returns {Promise<object>}
     */
    getChannelStatistics() {
        return GoogleAPIAuthorization.makeRequest({
            method: 'GET',
            accessToken: this.tokenData.accessToken,
            api: ApplicationVariables.YOUTUBE_API_SCOPE, 
            scope: YotubeScopes.CHANNELS,  
            params: { 
                key: ApplicationVariables.YOUTUBE_API_KEY, 
                part: "statistics", 
                id: this.channelID 
            }
        }).then((response) => {
            return response.items[0].statistics;
        });
    }

    /**
     * @returns {Promise<Array>}
     */
    getRecentSubscribers() {
        return GoogleAPIAuthorization.makeRequest({
            method: 'GET',
            accessToken: this.tokenData.accessToken,
            api: ApplicationVariables.YOUTUBE_API_SCOPE, 
            scope: YotubeScopes.SUBSCRIPTIONS, 
            params: { 
                key: ApplicationVariables.YOUTUBE_API_KEY, 
                part: 'subscriberSnippet', 
                myRecentSubscribers: 'true' 
            }
        }).then((response) => {
            return response.items;
        });
    }
}