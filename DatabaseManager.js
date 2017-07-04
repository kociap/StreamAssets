const ErrorSystem = require('errorSystem.js');
const fs = require('fs');
const Errors = require('Errors.js');

let usersFile = 'users.txt';

let users = JSON.parse(fs.readFileSync(usersFile, {encoding: 'utf-8'}));

function addUser(user) {
    return new Promise((resolve, reject) => {
        fs.writeFile(usersFile, JSON.stringify(users), (error) => {
            if(error) {
                reject(new Errors.DatabaseError(error));
                return;
            }
            
            users.push(user);
            resolve();
        });
    })
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