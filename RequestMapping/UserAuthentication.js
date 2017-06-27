const applicationVariables = rootRequire('applicationVariables.js');
const PendingRequestService = rootRequire('PendingRequestService.js');
const RoomsController = rootRequire('RoomsController.js');
const ErrorSystem = rootRequire('errorSystem.js');
const GoogleAPIAuthorization = require('../GoogleAPIAuthorization.js');
const YoutubeService = require('../YoutubeService.js');
const SessionManager = require('../SessionManager.js');
const buildURI = require('../utility.js').buildURI;

function processAuthenticationCode(code, redirectURI) {
    let apiAuthorizer = new GoogleAPIAuthorization(_io);
    let youtubeService = new YoutubeService(apiAuthorizer);
    youtubeService.setRedirectURI(redirectURI);
    apiAuthorizer.exchangeToken(code)
    .then((response) => {
        let tokenData = new TokenData(response.access_token, response.refresh_token, response.token_type, response.expires_in);
        apiAuthorizer.setTokensForScope(tokenData, applicationVariables.youtubeAPIScope);
        youtubeService.getChannelID()
        .then((id) => {
            youtubeService.setChannelID(id);
            requestPromise({
                method: 'POST',
                uri: '/users/' + id + '/tokens'
            }).catch((error) => {
                ErrorSystem.log(applicationVariables.errorLogFile, "Request failed", ErrorSystem.stacktrace(error));
            });
        });
    }).catch((error) => {
        ErrorSystem.log(applicationVariables.errorLogFile, "Could not exchange tokens", ErrorSystem.stacktrace(error));
    });
}

module.exports = (app) => {
    app.get('/authenticate-user/:sessionID', (req, res) => {
        let sessionID = req.params.sessionID;

        let promise = PendingRequestService.createPendingRequest(sessionID);

        promise.then((code) => {
            GoogleAPIAuthorization.exchangeCode(code, applicationVariables.domain + '/authentication-finalizing/' + sessionID)
            .then((tokenData) => {
                SessionManager.getSession(sessionID).setPrivateData('Token-Data', tokenData);
                YoutubeService.getChannelIDWithToken(tokenData.accessToken)
                .then((channelID) => {

                }).catch((error) => {
                    ErrorSystem.log(applicationVariables.errorLogFile, 'Could not fetch channel id', ErrorSystem.stacktrace(error));
                })
            }).catch((error) => {
                ErrorSystem.log(applicationVariables.errorLogFile, 'Could not authorize access', ErrorSystem.stacktrace(error));
            });
        }).catch((error) => {
            ErrorSystem.log(applicationVariables.errorLogFile, 'Could not authenticate user', ErrorSystem.stacktrace(error));
        });

        res.redirect(buildURI('https://accounts.google.com/o/oauth2/auth', {
            client_id: applicationVariables.clientID,
            scope: applicationVariables.youtubeAPIScope,
            redirect_uri: applicationVariables.domain + '/authentication-finalizing/' + sessionID,
            response_type: 'code',
            access_type: 'offline'
        }));

    });

    app.get('/authentication-finalizing/:sessionID/', (req, res) => {
        if(req.query.code) {
            PendingRequestService.resolvePendingRequest(req.params.sessionID, req.query.code);
            res.redirect('/dashboard');
        } else {
            PendingRequestService.rejectPendingRequest(req.params.sessionID, 'Authentication error');
            res.redirect('/?error=' + encodeURIComponent('Something went wrong, please try again in a few minutes'));
        }
    });
};