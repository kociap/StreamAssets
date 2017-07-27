const ErrorSystem = require('./errorSystem.js');
const ApplicationVariables = require('./ApplicationVariables.js');
const YoutubeService = require('./YoutubeService.js');
const DatabaseManager = require('./DatabaseManager.js');
const SocketRoom = require('./SocketRoom');
const Errors = require('./Errors');
const HttpStatus = require('./HttpStatus');

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
        throw new Error("RoomsController has already been initialized!");
    }

    initialized = true;
    _io = io;
    _io.on('connection', (client) => {
        client.on('room-change', (roomName) => { // Widget has connected
            Promise.resolve().then(() => {
                client.on('disconnecting', prematureDisconnection);
                return DatabaseManager.findUserByWidgetKey(roomName);
            }).then((user) => {
                if(user === null) {
                    throw new Errors.UnauthorizedWidgetKey(roomName);
                }

                return user;
            }).then((user) => {
                if(!roomExists()) {
                    let youtubeService = new YoutubeService(user.getChannelID(), user.getTokenData());
                    rooms[roomName] = new SocketRoom(_io, roomName, REQUEST_TIMEOUT);
                    rooms[roomName].setChannelService(youtubeService);
                }

                rooms[roomName].connectWidget(client);
                rooms[roomName].start();

                client.on('disconnecting', () => {
                    rooms[roomName].disconnectWidget(client);
                    if(rooms[roomName].isEmpty()) {
                        rooms[roomName].stop();
                        delete rooms[roomName];
                    }
                });
                client.removeListener('disconnecting', prematureDisconnection);
            }).catch((error) => {
                if(error instanceof Errors.DatabaseError) {
                    client.emit('server-error', { code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Server could not process widget connection'})
                    ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, error.message, error.stack);
                } else if(error instanceof Errors.UnauthorizedWidgetKey) {
                    client.emit('not-logged-in', { code: HttpStatus.FORBIDDEN, message: 'Server could not process widget connection'})
                }
            });

            function prematureDisconnection() {
                throw new Errors.UnexpectedDisconnection('Widget disconnected unexpectedly!');
            }
        });
    });
}

function roomExists(roomName) {
    return rooms.hasOwnProperty(roomName);
}

module.exports = {
    init: init,
}