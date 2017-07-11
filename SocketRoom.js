const ErrorSystem = require('./errorSystem.js');

module.exports = class SocketRoom {
    constructor(io, roomName, timeout) {
        this.io = io;
        this.roomName = roomName;
        this.numberOfConnectedWidgets = 0;
        this.run = true;
        this.timeout = timeout;
        this.channelService = null;
    }

    connectWidget(client) {
        client.join(this.roomName);
        this.numberOfConnectedWidgets++;
    }

    disconnectWidget(client) {
        this.numberOfConnectedWidgets--;
    }

    size() {
        return this.numberOfConnectedWidgets;
    }

    setChannelService(channelService) {
        this.channelService = channelService;
    }

    start() {
        this.run = true;
        this.requestData();
    }

    stop() {
        this.run = false;
    }

    requestData() {
        let time = Date.now();

        if(!this.run) {
            return;
        }

        let channelStatistics = this.channelService.getChannelStatistics()
        .then((statistics) => {
            // Send obtained data to client
            this.io.to(this.roomName).emit('channel-statistics-update', statistics);
        }).catch((error) => {
            ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'Could not fetch channel statistics', ErrorSystem.stacktrace(error));
        });

        let recentSubscribers = this.channelService.getRecentSubscribers()
        .then((subscribers) => {
            // Send obtained data to client
            this.io.to(this.roomName).emit('channel-subscribers-update', subscribers);
        }).catch((error) => {
            ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'Could not fetch channel subscribers', ErrorSystem.stacktrace(error));
        });

        // Update after timeout once all requests are done
        Promise.all([channelStatistics, recentSubscribers]).then(() => {
            if(Date.now() - time >= this.timeout) {
                this.requestData();
            } else {
                setTimeout(() => {
                    this.requestData();
                }, this.timeout - (Date.now() - time));
            }
        });        
    }
}