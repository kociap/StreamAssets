const Session = require('./Session.js');

let sessions = {};

/**
 * 
 * @param {string} sessionID 
 * @throws
 */
function createEmptySession(sessionID) {
    if(exists(sessionID)) {
        throw new Error("Session with ID " + sessionID + " already exists");
    }

    return sessions[sessionID] = new Session();
}

function createSession(sessionID, data) {
    if(exists(sessionID)) {
        throw new Error("Session with ID " + sessionID + " already exists");
    }

    return session[sessionID] = new Session(data);
}

function endSession(sessionID) {
    delete sessions[sessionID];
}

function getSession(sessionID) {
    if(!exists(sessionID)) {
        throw new Error("Session with ID " + sessionID + " doesn't exist");
    }

    return sessions[sessionID];
}

function exists(sessionID) {
    return sessions.hasOwnProperty(sessionID);
}

module.exports = {
    createSession: createSession,
    createEmptySession: createEmptySession,
    endSession: endSession,
    getSession: getSession,
    exists: exists,
};