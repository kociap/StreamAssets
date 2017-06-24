// const TokenRepository = require('./TokenRepository.js');
const GoogleAPIAuthorization = require("./GoogleAPIAuthorization.js");
const TokenData = require('./TokenData.js');
const ErrorSystem = require('./errorSystem.js');
const applicationVariables = require('./applicationVariables.js');
const YoutubeService = require('./YoutubeService.js');
const requestPromise = require('request-promise');

const REQUEST_TIMEOUT = 500;

let _io = null;
let initialized = false;

let rooms = {};

/**
 * Initializes room controller
 * @param {SocketIO.Server} io 
 * @throws Error if already initialized
 */
function init(io) {
    if(initialized) {
        throw new Error("RoomsController has already been initialized");
    }

    initialized = true;
    _io = io;
    _io.on('connection', (client) => {
        client.on('room-change', (roomName) => {
            // Widget connected

            if(!(roomName in rooms)) {
                rooms[roomName] = new SocketRoom(_io, roomName, REQUEST_TIMEOUT);
            }
            rooms[roomName].connectWidget(client);
            rooms[roomName].start();

            client.on('disconnecting', () => {
                rooms[roomName].disconnectWidget(client);
                if(rooms[roomName].size() == 0) {
                    // Delete if no widgets are connected
                    roomsRequesters[roomName].stop();
                    delete roomsRequesters[roomName];
                }
            });
        });
    });
}

module.exports = {
    init: init,
}