const ErrorSystem = require('errorSystem.js');
const fs = require('fs');

let usersFile = 'users.txt';

let users = JSON.parse(fs.readFileSync(usersFile, {encoding: 'utf-8'}));

function addUser(user) {
    users.push(user);
    fs.writeFileSync(usersFile, JSON.stringify(users));
}

function getUserByChannelID(channelID) {
    return users.find((user) => {
        return user.channelID === channelID;
    }) || null;
}

module.exports = {
    addUser: addUser,
    getUserByChannelID: getUserByChannelID
}