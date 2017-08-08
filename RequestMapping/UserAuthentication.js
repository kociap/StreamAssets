const ApplicationVariables = require('../ApplicationVariables.js');
const ErrorSystem = require('../errorSystem.js');
const buildURI = require('../utility.js').buildURI;
const Router = require('../Router.js').getRouter();
const Cookies = require('./Cookies.js');
const YoutubeService = require('../YoutubeService.js');
const DatabaseManager = require('../DatabaseManager.js');
const User = require('../User.js');
const RandomHashService = require('../RandomHashService.js');

Router.get('/youtube/login', (req, res) => {
    let accountID = req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
    if(!accountID) {
        accountID = RandomHashService.generateUserToken();
    }
    
    Cookies.setResponseHeaderToSetAccountCookie(res, accountID);

    res.redirect(buildURI('https://accounts.google.com/o/oauth2/auth', {
        client_id: ApplicationVariables.CLIENT_ID,
        scope: ApplicationVariables.YOUTUBE_API_SCOPE,
        redirect_uri: ApplicationVariables.YOUTUBE_OAUTH_REDIRECT_URI,
        response_type: 'code',
        access_type: 'offline'
    }));
});

Router.get('/youtube/auth', (req, res) => {
    let accountID = req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
    let code = req.query['code'];
    if(!accountID) {
        res.redirect('/?notice=' + encodeURIComponent("You have to log in first!"));
        return;
    }

    if(!code) {
        removeCookieAndRedirect();
    }

    authorizeAndGenerateUserDataAndSave(code, accountID).then(() => {
        res.redirect('/dashboard');
    }).catch((error) => {
        ErrorSystem.log.error(error);
        removeCookieAndRedirect();
    });

    function removeCookieAndRedirect() {
        Cookies.setResponseHeaderToRemoveCookie(res, ApplicationVariables.USER_ACCOUNT_COOKIE_NAME);
        res.redirect('/?error=' + encodeURIComponent('Something bad happened, please try again in a few minutes'));
    }
});

function authorizeAndGenerateUserDataAndSave(code, accountToken) {
    return YoutubeService.authorizeAccessCode(code)
           .then((tokenData) => {
                return YoutubeService.getChannelIDWithToken(tokenData.accessToken)
                       .then((channelID) => {
                            return DatabaseManager.setUserProperties(channelID, {
                                        tokenData: tokenData,
                                        accountToken: accountToken
                                   }).catch((error) => {
                                        return DatabaseManager.addUser(new User(channelID, tokenData, RandomHashService.generateWidgetKey(), accountToken));
                                   });
                       });
           });
}