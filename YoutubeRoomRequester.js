const EventSystem = require('events');
const YoutubeService = require('./YoutubeService.js');
const GoogleAPIAuthorization = require("./GoogleAPIAuthorization.js");
const errorSystem = require('./errorSystem.js');
const applicationVariables = require('./applicationVariables.js');

module.exports = class YoutubeRoomRequester {
    /**
     * @param {SocketIO.Server} io Socket
     * @param {string} room Room name
     * @param {string} apiKey Youtube API key
     * @param {number} timeout Minimum time to wait between requests
     * @param {string} channelID 
     */
    constructor(io, room, timeout, channelID) {
        this.room = room;
        this.youtubeService = new YoutubeService(new GoogleAPIAuthorization(io), channelID);
        this.events = new EventSystem();
        this.io = io;
        this.timeout = timeout;
        this.stop = false;

        this.events.on('youtube-statistics-update', (statistics) => {
            io.sockets.in(this.room).emit('subscribers', statistics.subscriberCount);
        });
    }

    setClientID(clientID) {
        this.youtubeService.setClientID(clientID);
    }

    setClientSecret(clientSecret) {
        this.youtubeService.setClientSecret(clientSecret);
    }

    setRedirectURI(redirectURI) {
        this.youtubeService.setRedirectURI(redirectURI);
    }

    setTokens(tokensData) {
        this.youtubeService.setTokens(tokensData);
    }

    requestRoomData() {
        let time = Date.now();

        if(this.stop) {
            return;
        }

        let channelStatistics = youtubeService.getChannelStatistics()
        .then((statistics) => {
            // Send obtained data to client
            this.events.emit('youtube-statistics-update', statistics);
        }).catch((error) => {
            errorSystem.log(applicationVariables.errorLogFile, 'Error: Could not fetch data', errorSystem.stacktrace(error));
        });

        let recentSubscribers = youtubeService.getRecentSubscribers()
        .then((subscribers) => {
            // Send obtained data to client
            this.events.emit('youtube-subscribers-update', subscribers);
        }).catch((error) => {
            errorSystem.log(applicationVariables.errorLogFile, 'Error: Could not fetch data', errorSystem.stacktrace(error));
        });

        // Update after timeout once all requests are done
        Promise.all([channelStatistics, recentSubscribers]).then(() => {
            if(Date.now() - time >= this.timeout) {
                this.requestRoomData();
            } else {
                setTimeout(() => {
                    this.requestRoomData();
                }, this.timeout - (Date.now() - time));
            }
        });
    }

    break() {
        this.stop = true;
    }
}