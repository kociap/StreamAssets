const ErrorSystem = require('./errorSystem.js');
const ApplicationVariables = require('./ApplicationVariables.js');
const YoutubeService = require('./YoutubeService.js');
const DatabaseManager = require('./DatabaseManager.js');
const SocketRoom = require('./SocketRoom');
const Errors = require('./Errors');
const HttpStatus = require('./HttpStatus');

let _io = null;
let initialized = false;

let rooms = {};

/**
 * Initializes room controller
 * @param {SocketIO.Server} io
 * @throws Error if already initialized
 */
function init(io) {
    if (initialized) {
        throw new Error("RoomsController has already been initialized!");
    }

    if (!io) {
        throw new Errors.RequiredArgumentNotSupplied("io");
    }

    initialized = true;
    _io = io;
    _io.of(ApplicationVariables.WIDGETS_SOCKET_NAMESPACE).use((socket, next) => {
        if (socket.handshake.query['token']) {
            next();
        } else {
            next(new Errors.MissingQueryParameter('token'));
        }
    });
    _io.of(ApplicationVariables.WIDGETS_SOCKET_NAMESPACE)
       .on('connection', (client) => {
            const roomName = client.handshake.query['token'];
            const widgetKey = client.handshake.query['token']; // Room name is also the widgetKey of the user
            let prematurelyDisconnected = false;

            client.on('disconnecting', prematureDisconnection);

            Promise.resolve()
                .then(findUserByWidgetKey)
                .then(checkIfUserWasFound)
                .then((user) => {
                    if (!roomExists()) {
                        let youtubeService = new YoutubeService(user.getChannelID(), user.getTokenData());
                        rooms[roomName] = new SocketRoom(_io, roomName, ApplicationVariables.DATA_REQUEST_TIMEOUT);
                        rooms[roomName].setChannelService(youtubeService);
                        ErrorSystem.log('Room ' + roomName + ' created');
                    }

                    rooms[roomName].connectWidget(client);
                    rooms[roomName].start();

                    client.removeListener('disconnecting', prematureDisconnection);

                    if (prematurelyDisconnected) {
                        rooms[roomName].disconnectWidget(client);
                        deleteRoomIfEmpty(roomName);
                        throw new Errors.UnexpectedDisconnection("Widget disconnected unexpectedly!");
                    }

                    client.on('disconnecting', () => {
                        rooms[roomName].disconnectWidget(client);
                        deleteRoomIfEmpty(roomName);
                    });
                    ErrorSystem.log("Widget successfully added to the room " + roomName);
                }).catch((error) => {
                    if (error instanceof Errors.DatabaseError) {
                        client.emit('server-error', { code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Server could not process widget connection' })
                        ErrorSystem.log.error(error);
                    } else if (error instanceof Errors.UnauthorizedWidgetKey) {
                        client.emit('not-logged-in', { code: HttpStatus.FORBIDDEN, message: 'Server could not process widget connection' })
                    }
                });

            function prematureDisconnection() {
                prematurelyDisconnected = true;
            }

            function checkIfUserWasFound(user) {
                if (user === null) {
                    throw new Errors.UnauthorizedWidgetKey(widgetKey);
                } else {
                    return user;
                }
            }

            function findUserByWidgetKey() {
                return DatabaseManager.findUserByWidgetKey(widgetKey);
            }

            function deleteRoomIfEmpty(roomName) {
                if (rooms[roomName].isEmpty()) {
                    rooms[roomName].stop();
                    delete rooms[roomName];
                }
            }
        });
}

function roomExists(roomName) {
    return rooms.hasOwnProperty(roomName);
}

module.exports = {
    init: init,
};
