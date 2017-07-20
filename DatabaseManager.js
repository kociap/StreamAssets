const ErrorSystem = require('./errorSystem.js');
const fs = require('fs');
const Errors = require('./Errors.js');
const ApplicationVariables = require('./ApplicationVariables.js');

let usersFile = 'users.txt';

let users = [];

(function startUp() {
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
})();

function addUser(user) {
    return writeToDatabase(user)
           .then(() => {
               users.push(user);
           });
}

/**
 * @param {User} [newUser]
 * @returns {Promise<void, Errors.DatabaseError>}
 */
function writeToDatabase(newUser) {
    return new Promise((resolve, reject) => {
        fs.writeFile(usersFile, JSON.stringify((newUser ? users.concat([newUser]) : users)), (error) => {
            if(error) {
                reject(new Errors.DatabaseError(error));
                return;
            }

            resolve();
        });
    });
}

function setUserTokenData(channelID, tokenData) {
    return new Promise((resolve, reject) => {
        findUserByChannelID(channelID)
        .then((user) => {
            if(user === null) {
                reject(new Errors.EntityDoesNotExist());
                return;
            }

            let oldTokenData = user.tokenData;
            user.tokenData = tokenData;
            writeToDatabase()
            .then(() => {
                resolve();
            }).catch((error) => {
                user.tokenData = oldTokenData;
                reject(error)
            });
        });
    });
}

function setUserWidgetKey(channelID, widgetKey) {
    return new Promise((resolve, reject) => {
        findUserByChannelID(channelID)
        .then((user) => {
            if(user === null) {
                reject(new Errors.EntityDoesNotExist());
                return;
            }

            let oldWidgetKey = user.widgetKey;
            user.widgetKey = widgetKey;
            writeToDatabase()
            .then(() => {
                resolve();
            }).catch((error) => {
               user.widgetKey = oldWidgetKey;
                reject(error)
            });
        });
    });
}

function findUser(user) {
    return new Promise((resolve, reject) => {
        resolve(
            users.find((userToCompareAgainst) => {
                return user.equals(userToCompareAgainst);
            }) || null
        );
    });
}

function findUserByChannelID(channelID) {
    return new Promise((resolve, reject) => {
        resolve(
            users.find((user) => {
                return user.channelID === channelID;
            }) || null
        );
    });
}

/**
 * @param {string} widgetKey 
 */
function findUserByWidgetKey(widgetKey) {
    return new Promise((resolve, reject) => {
        resolve(
            usersFile.find((user) => {
                return user.widgetKey === widgetKey;
            }) || null
        );
    });
}

module.exports = {
    addUser: addUser,
    setUserTokenData: setUserTokenData,
    setUserWidgetKey: setUserWidgetKey,
    findUserByChannelID: findUserByChannelID,
    findUserByWidgetKey: findUserByWidgetKey
}