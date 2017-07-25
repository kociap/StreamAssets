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
const cookieParser= require('cookie-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

require('./Router.js').setRouter(app);
const ApplicationVariables = require('./ApplicationVariables.js');

// Request mapping
require('./RequestMapping/RequestMapper.js');
require('./RequestMapping/Sessions.js');
require('./RequestMapping/UserAuthentication.js');

const RoomsController = require('./RoomsController.js');
RoomsController.init(io);

http.listen(Number(ApplicationVariables.SERVER_PORT), () => {
    console.log(`Server launched at ${ApplicationVariables.SERVER_PORT}`);
});
