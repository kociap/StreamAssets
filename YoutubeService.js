const applicationVariables = require('./applicationVariables.js');
const errorSystem = require("./errorSystem.js");

module.exports = class YoutubeService {
    constructor(requestAuthorizer, channelID) {
        this.requestAuthorizer = requestAuthorizer;
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
     * @returns {Promise}
     */
    getChannelStatistics() {
        return new Promise((resolve, reject) => {
            this.requestAuthorizer.makeAuthorizedRequest('GET', applicationVariables.youtubeAPIScope, 'https://www.googleapis.com/youtube/v3/channels', { key: applicationVariables.youtubeAPIKey, part: "statistics", id: this.channelID })
            .then((response) => {
                resolve(response.items[0].statistics);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    /**
     * @returns {Promise}
     */
    getRecentSubscribers() {
        return new Promise((resolve, reject) => {
            this.requestAuthorizer.makeAuthorizedRequest('GET', applicationVariables.youtubeAPIScope, 'https://www.googleapis.com/youtube/v3/subscriptions', { key: applicationVariables.youtubeAPIKey, part: 'subscriberSnippet', myRecentSubscribers: 'true' })
            .then((response) => {
                resolve(response.items);
            }).catch((error) => {
                reject(error);
            });
        })
    }
}