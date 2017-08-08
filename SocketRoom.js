const ErrorSystem = require('./errorSystem');
const ApplicationVariables = require('./ApplicationVariables');
const Promise = require('bluebird');

module.exports = class SocketRoom {
    constructor(io, roomName, timeout) {
        this.io = io;
        this.roomName = roomName;
        this.numberOfConnectedWidgets = 0;
        this.runs = false;
        this.timeout = timeout;
        this.channelService = null;
    }

    connectWidget(widget) {
        widget.join(this.roomName);
        this.numberOfConnectedWidgets++;
    }

    disconnectWidget(client) {
        this.numberOfConnectedWidgets--;
    }

    size() {
        return this.numberOfConnectedWidgets;
    }

    isEmpty() {
        return this.numberOfConnectedWidgets === 0;
    }

    setChannelService(channelService) {
        this.channelService = channelService;
    }

    start() {
        if(!this.runs) {
            this.runs = true;
            this.requestData();
        }
    }

    stop() {
        this.runs = false;
    }

    requestData() {
        let time = Date.now();

        if(!this.runs) {
            return;
        }

        let channelStatistics = this.channelService.getChannelStatistics()
        .then((statistics) => {
            this.io.of(ApplicationVariables.WIDGETS_SOCKET_NAMESPACE).to(this.roomName).emit('statistics', statistics);
        }).catch((error) => {
            ErrorSystem.log.error('Could not fetch channel statistics', ErrorSystem.stacktrace(error));
        });

        let recentSubscribers = this.channelService.getRecentSubscribers()
        .then((subscribers) => {
            this.io.of(ApplicationVariables.WIDGETS_SOCKET_NAMESPACE).to(this.roomName).emit('new-followers', subscribers);
        }).catch((error) => {
            ErrorSystem.log.error('Could not fetch channel subscribers', ErrorSystem.stacktrace(error));
        });

        // Call recursively once all requests are fulfilled and specified time has passed
        Promise.all([channelStatistics, recentSubscribers]).then(() => {
            if(Date.now() - time >= this.timeout) {
                this.requestData();
            } else {
                Promise.delay(this.timeout - (Date.now() - time)).then(() => {
                    // console.log(this);
                    this.requestData();
                });
            }
        });        
    }
}