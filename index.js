'use strict';

global.rootRequire = (path) => {
    return require(__dirname + '/' + path);
}

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const opn = require('opn');
const fs = require('fs');
const request = require('request-promise');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./Router.js').setRouter(app);

// Request mapping
const requestMapper = require('./requestMapper.js')(app, io);
require('./RequestMapping/Sessions.js');
require('./RequestMapping/UserAuthentication.js');

const applicationVariables = require('./applicationVariables.js');
const RoomsController = require('./RoomsController.js');

// Data refresh time in milliseconds
const REFRESH_TIMEOUT = 500;
const ACCOUNT_ID = 'UCtlzktCIv86iJ3fFWlkvVog';

http.listen(Number(applicationVariables.serverPort), () => {
    console.log(`Server launched at ${applicationVariables.serverPort}`);
});

RoomsController.init(io);

// /**
//  * Loads tokens asynchronously
//  * @param {string} user 
//  * @param {string} scope 
//  * @returns {Promise<object>}
//  */
// function loadTokens(user, scope) {
//     return new Promise((resolve, reject) => {
//         fs.readFile('tokens.txt', (error, data) => {
//             if(error || data || !JSON.parse(data).hasOwnProperty(scope)) {
//                 resolve({});
//             } else {
//                 resolve(JSON.parse(data)[scope]);
//             }
//         });
//     });
// }