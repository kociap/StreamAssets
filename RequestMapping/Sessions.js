const ApplicationVariables = require('../ApplicationVariables.js');
const DatabaseManager = require('../DatabaseManager.js');
const SessionManager = require('../SessionManager.js');
const YoutubeService = require('../YoutubeService.js');
const GoogleAPIAuthorization = require('../GoogleAPIAuthorization.js');
const Base64 = require('../Base64.js');
const app = require('../Router.js').getRouter();
const User = require('../User.js');
const ErrorSystem = require('../errorSystem.js');
const Errors = require('../Errors.js');
const Utility = require('../utility.js');

// Improve ID generation

app.get('/sessions/new-session', (req, res) => {
    let sessionID = Base64.encode(Utility.reverseString(String(Date.now())));
    SessionManager.createEmptySession(sessionID);
    res.status(201);
    res.send(JSON.stringify({ "Session-ID": sessionID }));
});

app.get('/sessions/:sessionID', (req, res) => {
    let sessionID = req.params.sessionID;
    if(!SessionManager.exists(sessionID)) {
        res.status(440).send(JSON.stringify({ error: 'Session has expired' }));
        return;
    }

    let authorization;
    if(!isAuthorizedSession(sessionID)) {
        authorization = authorizeSession(sessionID);
    } else {
        authorization = Promise.resolve();
    }

    authorization.then(() => {
        res.set('Content-Type', 'application/json');
        res.status(200);
        res.cookie('Session-ID', sessionID);
        res.send(JSON.stringify(SessionManager.getSession(sessionID).getAllData()));
    }).catch((error) => {
        res.set('Content-Type', 'application/json');
        res.status(500);
        res.send(JSON.stringify(error));
        ErrorSystem.log(ApplicationVariables.errorLogFile, "Authorization error", ErrorSystem.stacktrace(error));
    });
});

app.get('/sessions/:sessionID/:requestedKeys', (req, res) => {
    let sessionID = req.params.sessionID;
    if(!SessionManager.exists(sessionID)) {
        res.status(440).send(JSON.stringify({ error: 'Session has expired' }));
        return;
    } 

    let authorization = Promise.resolve();
    if(!isAuthorizedSession(sessionID)) {
        authorization = authorizeSession(sessionID);
    }

    authorization.then(() => {
        let requestedKeys = req.params.requestedKeys.split(',');
        res.set('Content-Type', 'application/json');
        res.status(200);
        res.cookie('Session-ID', sessionID);
        res.send(JSON.stringify(SessionManager.getSession(sessionID).getDataByKeys(requestedKeys)));
    }).catch((error) => {
        res.set('Content-Type', 'application/json');
        res.status(500);
        res.send(JSON.stringify(error));
        ErrorSystem.log(ApplicationVariables.errorLogFile, "Authorization error", ErrorSystem.stacktrace(error));
    });
});

app.post('/sessions/:sessionID', (req, res) => {
    let sessionID = req.params.sessionID;
    if(!SessionManager.exists(sessionID)) {
        res.status(440).send(JSON.stringify({ error: 'Session has expired' }));
        return;
    }

    for(let key in req.body) {
        SessionManager.getSession(sessionID).setData(key, req.body[key]);
    }
    res.sendStatus(201);
});

function isAuthorizedSession(sessionID) {
    return SessionManager.getSession(sessionID).getPrivateData('Authentication-Code') === null && SessionManager.getSession(sessionID).getPrivateData('Token-Data') !== null;
}

function authorizeSession(sessionID) {
    return new Promise((resolve, reject) => {
        Promise.resolve()
        .then(() => {
            if(SessionManager.getSession(sessionID).getPrivateData('Authentication-Code') === null) {
                throw new Errors.AuthorizationError("Missing authentication code");
            }

            return GoogleAPIAuthorization.exchangeCode(SessionManager.getSession(sessionID).getPrivateData('Authentication-Code'), ApplicationVariables.domain + '/authentication-finalizing/' + sessionID)
        }).then((tokenData) => {
            SessionManager.getSession(sessionID).deletePrivateData('Authentication-Code');
            SessionManager.getSession(sessionID).setPrivateData('Token-Data', tokenData);
            return YoutubeService.getChannelIDWithToken(tokenData.accessToken);
        }).then((channelID) => {
            SessionManager.getSession(sessionID).setData('Channel-ID', channelID);
            return DatabaseManager.addUser(new User(SessionManager.getSession(sessionID).getPrivateData('Token-Data')));
        }).catch((error) => {
            if(error instanceof Errors.AuthorizationError) {
                reject({ error: 'User authorization failed', message: error.message });
            } else if(error instanceof Errors.RequestError) {
                reject({ error: "Could not request user's data", message: error.message });
            } else if(error instanceof Errors.DatabaseError) {
                reject({ error: "Database query failed", message: error.message });
            } else {
                reject({ error: "Unknown error", message: error.message });
            }
            SessionManager.endSession(sessionID);
        }).then(() => {
            resolve();
        })
    });
}