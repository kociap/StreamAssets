const ApplicationVariables = require('../ApplicationVariables.js');
const ErrorSystem = require('../errorSystem.js');
const buildURI = require('../utility.js').buildURI;
const app = require('../Router.js').getRouter();
const Cookies = require('./Cookies.js');
const YoutubeService = require('../YoutubeService.js');
const DatabaseManager = require('../DatabaseManager.js');
const User = require('../User.js');

function authorizeAndSave(code, accountID) {
    YoutubeService.authorizeAccessCode(code)
    .then((tokenData) => {
        YoutubeService.getChannelIDWithToken(tokenData.accessToken)
        .then((channelID) => {
            DatabaseManager.addOrUpdateUser(new User(channelID, tokenData));
        });
    });
}

app.get('/youtube/login', (req, res) => {
    let accountID = req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
    if(!accountID) {
        accountID = Cookies.getNewAccountToken();
        Cookies.setResponseHeaderToSetCookie(res, accountID);
    }

    res.redirect(buildURI('https://accounts.google.com/o/oauth2/auth', {
        client_id: ApplicationVariables.CLIENT_ID,
        scope: ApplicationVariables.YOUTUBE_API_SCOPE,
        redirect_uri: ApplicationVariables.YOUTUBE_OAUTH_REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline'
    }));
});

app.get('/youtube/auth', (req, res) => {
    let accountID = req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
    let code = req.query['code'];
    if(!accountID) {
        res.redirect('/?notice=' + encodeURIComponent("Whoa! Something's missing"));
        return;
    }

    if(code) {
        authorizeAndSave(code, accountID);
        res.redirect('/dashboard');
    } else {
        ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'Could not authenticate user', ErrorSystem.stacktrace(req.query['error']));
        Cookies.setResponseHeaderToRemoveCookie(res, ApplicationVariables.USER_ACCOUNT_COOKIE_NAME);
        res.redirect('/?error=' + encodeURIComponent('Something went wrong, please try again in a few minutes'));
    }
});
