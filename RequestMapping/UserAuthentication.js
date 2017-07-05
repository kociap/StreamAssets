const applicationVariables = require('../applicationVariables.js');
const PendingRequestService = require('../PendingRequestService.js');
const RoomsController = require('../RoomsController.js');
const ErrorSystem = require('../errorSystem.js');
const GoogleAPIAuthorization = require('../GoogleAPIAuthorization.js');
const YoutubeService = require('../YoutubeService.js');
const SessionManager = require('../SessionManager.js');
const buildURI = require('../utility.js').buildURI;
const User = require('../User.js');
const DatabaseManager = require('../DatabaseManager.js');
const app = require('../Router.js').getRouter();

app.get('/authenticate-user/:sessionID', (req, res) => {
    let sessionID = req.params.sessionID;
    let promise = PendingRequestService.createPendingRequest(sessionID);

    res.redirect(buildURI('https://accounts.google.com/o/oauth2/auth', {
        client_id: applicationVariables.clientID,
        scope: applicationVariables.youtubeAPIScope,
        redirect_uri: applicationVariables.domain + '/authentication-finalizing/' + sessionID,
        response_type: 'code',
        access_type: 'offline'
    }));

});

app.get('/authentication-finalizing/:sessionID/', (req, res) => {
    let sessionID = req.params.sessionID;
    if(req.query.code) {
        PendingRequestService.resolvePendingRequest(req.params.sessionID, req.query.code)
        .then((code) => {
            SessionManager.getSession(sessionID).setPrivateData('Authentication-Code', code);
            res.redirect('/dashboard');
        });
    } else {
        PendingRequestService.rejectPendingRequest(req.params.sessionID, 'Authentication error')
        .catch((error) => {
            ErrorSystem.log(applicationVariables.errorLogFile, 'Could not authenticate user', ErrorSystem.stacktrace(error));
            res.redirect('/?error=' + encodeURIComponent('Something went wrong, please try again in a few minutes'));
        });
    }
});