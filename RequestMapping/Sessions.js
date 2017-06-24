const Sessions = require('../SessionManager.js');
const Base64 = require('../Base64.js');

// Improve ID generation

module.exports = (app) => {
    app.get('/sessions/new-session', (req, res) => {
        let sessionID = Base64.encode(String(Date.now()));
        Sessions.createEmptySession();
        res.status(201);
        res.send({ "Session-ID": sessionID });
    });

    app.get('/sessions/:sessionID', (req, res) => {
        res.set('Content-Type', 'application/json');
        if(Sessions.exists(req.params.sessionID) && !Sessions.expired(req.params.sessionID)) {
            res.status(200);
            res.cookie('Session-ID', req.params.sessionID);
            res.send(Sessions.getSession(req.params.sessionID));
        } else {
            let newSessionID = Base64.encode(String(Date.now()));
            res.status(201);
            res.cookie('Session-ID', newSessionID);
            res.send(Sessions.createEmptySession(newSessionID));
        }
    });

    app.get('/sessions/:sessionID/:requestedKeys', (req, res) => {
        let requestedKeys = req.params.requestedKeys.split(',');
        res.set('Content-Type', 'application/json');
        if(Sessions.exists(req.params.sessionID) && !Sessions.expired(req.params.sessionID)) {
            res.status(200);
            res.cookie('Session-ID', req.params.sessionID);
            res.send(Sessions.createEmptySession(newSessionID).getDataByKeys(requestedKeys));
        } else {
            let newSessionID = Base64.encode(String(Date.now()));
            res.status(201);
            res.cookie('Cookie-ID', newSessionID);
            res.send(Sessions.createEmptySession(newSessionID).getDataByKeys(requestedKeys));
        }
    });

    app.post('/sessions/:sessionID', (req, res) => {
        if(!Sessions.exists(req.params.sessionID) || Sessions.expired(req.params.sessionID)) {
            res.status(440).send('Session has expired');
        }

        for(let key in req.body) {
            Sessions[req.params.sessionID].setData(key, req.body[key]);
        }
        res.sendStatus(201);
    });
};