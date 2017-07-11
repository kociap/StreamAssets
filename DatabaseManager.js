const ErrorSystem = require('./errorSystem.js');
const fs = require('fs');
const Errors = require('./Errors.js');
const ApplicationVariables = require('./ApplicationVariables.js');

let usersFile = 'users.txt';

let users = [];

new Promise((resolve, reject) => {
    fs.writeFile(__dirname + '/' + usersFile, '', { flag: 'wx' }, (error) => {
        resolve();
    });
}).then(() => {
    fs.readFile(__dirname + '/' + usersFile, { encoding: 'utf-8' }, (error, data) => {
        if(error) {
            ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'File reading failed', error.stack);
        } else {
            try {
                users = JSON.parse(data);
            } catch(e) {
                ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'Data reading failed due to syntax error', ErrorSystem.stacktrace(e));
            }
        }
    });
});

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