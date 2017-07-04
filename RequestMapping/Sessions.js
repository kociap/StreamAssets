const applicationVariables = require('../ApplicationVariables.js');
const DatabaseManager = require('../DatabaseManager.js');
const SessionManager = require('../SessionManager.js');
const YoutubeService = require('../YoutubeService.js');
const Base64 = require('../Base64.js');
const app = require('../Router.js').getRouter();
const User = require('../User.js');
const ErrorSystem = require('../errorSystem.js');
const Errors = require('../Errors.js');

// Improve ID generation

app.get('/sessions/new-session', (req, res) => {
    let sessionID = Base64.encode(String(Date.now()));
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

    let authorization = Promise.resolve();
    if(!isAuthorizedSession(sessionID)) {
        authorization = authorizeSession(sessionID);
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
    return SessionManager.getSession(sessionID).getPrivateData('Token-Data') !== null;
}

function authorizeSession(sessionID) {
    return new Promise((resolve, reject) => {
        GoogleAPIAuthorization.exchangeCode(SessionManager.getSession(sessionID).getPrivateData('Code'), applicationVariables.domain + '/authentication-finalizing/' + sessionID)
        .then((tokenData) => {
            SessionManager.getSession(sessionID).deletePrivateData('Authentication-Code');
            SessionManager.getSession(sessionID).setPrivateData('Token-Data', tokenData);
            return YoutubeService.getChannelIDWithToken(tokenData.accessToken);
        }).then((channelID) => {
            SessionManager.getSession(sessionID).setData('Channel-ID', channelID);
            return DatabaseManager.addUser(new User(SessionManager.getSession(sessionID).getPrivateData('Token-Data')));
        }).catch((error) => {
            if(error instanceof Errors.AuthorizationError) {
                SessionManager.getSession(sessionID).deletePrivateData('Authentication-Code');
                reject({ error: 'User authorization failed' });
            } else if(error instanceof Errors.RequestError) {
                SessionManager.getSession(sessionID).deletePrivateData('TokenData');
                reject({ error: "Could not request user's data" });
            } else if(error instanceof Errors.DatabaseError) {
                SessionManager.getSession(sessionID).deletePrivateData('TokenData');
                SessionManager.getSession(sessionID).deleteData('Channel-ID');
                reject({ error: "Database query failed" });
            }
        });

        resolve();
    });
}