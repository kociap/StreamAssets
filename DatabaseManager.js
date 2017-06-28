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

/**
 * @param {string} widgetKey 
 */
function getUserByWidgetKey(widgetKey) {
    return usersFile.find((user) => {
        return user.widgetKey === widgetKey;
    }) || null;
}

module.exports = {
    addUser: addUser,
    getUserByChannelID: getUserByChannelID,
    getUserByWidgetKey: getUserByWidgetKey
}