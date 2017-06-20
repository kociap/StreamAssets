'use strict';

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const requestMapper = require('./requestMapper.js')(app, io);
const opn = require('opn');
const request = require('request-promise');
const fs = require('fs');

const GoogleAPIAuthorization = require('./GoogleAPIAuthorization.js');
const YoutubeService = require('./YoutubeService.js');
const errorSystem = require('./errorSystem.js');
const EventSystem = require('events');
const Events = new EventSystem();
const YoutubeRoomRequester = require("./YoutubeRoomRequester.js");
const applicationVariables = require('./applicationVariables.js');

// Data refresh time in milliseconds
const REFRESH_TIMEOUT = 500;
const ACCOUNT_ID = 'UCtlzktCIv86iJ3fFWlkvVog';

http.listen(Number(applicationVariables.serverPort), () => {
    console.log(`Server launched at ${applicationVariables.serverPort}`);
});

// let youtubeService;
// let apiAuthorization = new GoogleAPIAuthorization(io);
// apiAuthorization.setClientID(applicationVariables.clientID);
// apiAuthorization.setClientSecret(applicationVariables.clientSecret);
// apiAuthorization.setRedirectURI(`${URI_ORIGIN}/authentication-finalizing`);
// loadTokens('', "https://www.googleapis.com/auth/youtube")
// .then((tokensObject) => {
//     apiAuthorization.setTokens(tokensObject);
//     youtubeService = new YoutubeService(apiAuthorization, ACCOUNT_ID);
//     youtubeService.getChannelStatistics().then((statistics) => {
//         subscriberCount = statistics.subscriberCount;
//         refreshData();
//     });
// });



let roomsRequesters = {};

io.on('connection', (socket) => {
    console.log("Client connected", socket.id);

    socket.on('youtube-room', (room) => {
        console.log('Requested room change', room);
        socket.join(room);
        if(!(room in roomsRequesters)) {
            roomsRequesters[room] = new YoutubeRoomRequester(io, room, REFRESH_TIMEOUT, ACCOUNT_ID);
            roomsRequesters[room].setRedirectURI(applicationVariables.domain + '/authentication-finalizing');
            loadTokens('', "https://www.googleapis.com/auth/youtube")
            .then((tokensObject) => {
                roomsRequesters[room].setTokens(tokensObject);
                roomsRequesters.requestRoomData();
            });
        }
    });

    socket.on('disconnecting', () => {
        console.log('Disconnecting from rooms', socket.rooms);
        console.log(io.sockets.adapter.rooms);
        for(let roomName of Object.keys(socket.rooms)) {
            if((roomName in roomsRequesters) && (!io.sockets.adapter.rooms.hasOwnProperty(roomName))) {
                roomsRequesters.roomName.break();
                delete roomsRequesters.roomName;
            }
        }
    });
});

/**
 * Loads tokens asynchronously
 * @param {string} user 
 * @param {string} scope 
 * @returns {Promise<object>}
 */
function loadTokens(user, scope) {
    return new Promise((resolve, reject) => {
        fs.readFile('tokens.txt', (error, data) => {
            if(error || data || !JSON.parse(data).hasOwnProperty(scope)) {
                resolve({});
            } else {
                resolve(JSON.parse(data)[scope]);
            }
        });
    });
}