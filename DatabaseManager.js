const ErrorSystem = require('./errorSystem');
const fs = require('fs');
const Errors = require('./Errors');
const ApplicationVariables = require('./ApplicationVariables');
const User = require('./User');

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
                ErrorSystem.log.error('File reading failed', ErrorSystem.stacktrace(error));
            } else {
                try {
                    users = JSON.parse(data);
                } catch(e) {
                    ErrorSystem.log.error('Data reading failed due to syntax error', ErrorSystem.stacktrace(e));
                }
            }
        });
    });
})();

function addUser(user) {
    return _writeToDatabase(user)
           .then(() => {
               users.push(user);
           });
}

/**
 * Strong expection guarantee
 * @param {string} channelID
 * @param {} properties 
 * @returns {Promise<void, Errors.EntityDoesNotExist>}
 */
function _updateUser(channelID, properties) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find((user) => { // Keeps reference
            return user.channelID === channelID;
        }) || null;

        if(foundUser) {
            let userBackup = Object.assign({}, foundUser);
            Object.assign(foundUser, properties);
            _writeToDatabase().then(() => {
                resolve();
            }).catch((error) => {
                Object.assign(foundUser, userBackup);
                reject(error);
            })
        } else {
            throw new Errors.EntityDoesNotExist();
        }
    });
}

/**
 * @param {User} [newUser]
 * @returns {Promise<void, Errors.DatabaseAccessFailure>}
 */
function _writeToDatabase(newUser) {
    return new Promise((resolve, reject) => {
        fs.writeFile(usersFile, JSON.stringify((newUser ? users.concat([newUser]) : users)), (error) => {
            if(error) {
                throw new Errors.DatabaseAccessFailure(error);
            }

            resolve();
        });
    });
}

/**
 * 
 * @param {string} channelID 
 * @param {string} tokenData 
 * @returns {Promise<void, Errors.EntityDoesNotExist>}
 */
function setUserTokenData(channelID, tokenData) {
    return _updateUser(channelID, { 'tokenData': tokenData });
}

/**
 * 
 * @param {string} channelID 
 * @param {string} widgetKey 
 * @returns {Promise<void, Errors.EntityDoesNotExist>}
 */
function setUserWidgetKey(channelID, widgetKey) {
    return _updateUser(channelID, { 'widgetKey': widgetKey });
}

/**
 * 
 * @param {string} channelID 
 * @param {string} accountToken 
 * @returns {Promise<void, Errors.EntityDoesNotExist>}
 */
function setUserAccountToken(channelID, accountToken) {
    return _updateUser(channelID, { 'accountToken': accountToken });
}

function setUserProperties(channelID, properties) {
    let _properties = {};
    if(properties['widgetKey']) {
        _properties['widgetKey'] = properties['widgetKey'];
    }
    if(properties['tokenData']) {
        _properties['tokenData'] = properties['tokenData'];
    }
    if(properties['accountToken']) {
        _properties['accountToken'] = properties['accountToken'];
    }
    return _updateUser(channelID, _properties);
}

/**
 * @param {string} widgetKey 
 * @returns {Promise<User|null, Errors.DatabaseAccessError>}
 */
function findUserByChannelID(channelID) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find((user) => {
                return user.channelID === channelID;
            });

        if(foundUser) {
            resolve(new User(foundUser.channelID, foundUser.tokenData, foundUser.widgetKey, foundUser.accoutToken));
        } else {
            resolve(null);
        }
    });
}

/**
 * @param {string} widgetKey 
 * @returns {Promise<User|null>}
 */
function findUserByWidgetKey(widgetKey) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find((user) => {
                return user.widgetKey === widgetKey;
            });

        if(foundUser) {
            resolve(new User(foundUser.channelID, foundUser.tokenData, foundUser.widgetKey, foundUser.accoutToken));
        } else {
            resolve(null);
        }
    });
}

/**
 * @param {string} widgetKey 
 * @returns {Promise<User|null>}
 */
function findUserByAccountToken(accountToken) {
    return new Promise((resolve, reject) => {
        let foundUser = users.find((user) => {
                return user.accountToken === accountToken;
            });

        if(foundUser) {
            resolve(new User(foundUser.channelID, foundUser.tokenData, foundUser.widgetKey, foundUser.accountToken));
        } else {
            resolve(null);
        }
    });
}

module.exports = {
    addUser: addUser,
    setUserTokenData: setUserTokenData,
    setUserWidgetKey: setUserWidgetKey,
    setUserAccountToken: setUserAccountToken,
    setUserProperties: setUserProperties,
    findUserByChannelID: findUserByChannelID,
    findUserByWidgetKey: findUserByWidgetKey,
    findUserByAccountToken: findUserByAccountToken
};
