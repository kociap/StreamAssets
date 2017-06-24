const applicationVariables = rootRequire('applicationVariables.js');
const PendingAuthenticationRequestService = rootRequire('PendingAuthenticationRequestService.js');
const RoomsController = rootRequire('RoomsController.js');
const ErrorSystem = rootRequire('errorSystem.js');

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
    app.get('/authenticate-user', (req, res) => {
        let userID = req.query['Session-ID'];

        let promise = PendingAuthenticationRequestService.createPendingRequest(userID);

        promise.then((code) => {
            RoomsController.processAuthenticationCode(code, applicationVariables.domain + '/authentication-finalizing/' + userID + '/');
        }).catch((error) => {
            ErrorSystem.log(applicationVariables.errorLogFile, 'Could not authenticate user', ErrorSystem.stacktrace(error));
        });

        res.redirect(buildURI('https://accounts.google.com/o/oauth2/auth', {
            client_id: applicationVariables.clientID,
            scope: applicationVariables.youtubeAPIScope,
            redirect_uri: applicationVariables.domain + '/authentication-finalizing/' + userID + '/',
            response_type: 'code',
            access_type: 'offline'
        }));

    });

    app.get('/authentication-finalizing/:userID/', (req, res) => {
        if(req.query.code) {
            PendingAuthenticationRequestService.resolvePendingRequest(req.params.userID, req.query.code);
            res.redirect('/dashboard');
        } else {
            PendingAuthenticationRequestService.rejectPendingRequest(req.params.userID, 'Authentication error');
            res.redirect('/?error=' + encodeURIComponent('Something went wrong, please try again in a few minutes'));
        }
    });
};

/**
 * Builds uri with given base request uri and parameters
 * @param {string} requestURI 
 * @param {object} params 
 * @returns {string}
 */
function buildURI(requestURI, params) {
    let requestParams = [];
    for (let key of Object.keys(params)) {
        requestParams.push(`${key}=${params[key]}`);
    }
    return requestURI + '?' + requestParams.join('&');
}