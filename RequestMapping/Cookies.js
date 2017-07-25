const ApplicationVariables = require('../ApplicationVariables.js');
const requestPromise = require('request-promise');
const ErrorSystem = require('../ErrorSystem.js');
const Base64 = require('../Base64.js');
const Utility = require('../Utility.js');

module.exports = {
    hasAccountCookie: hasAccountCookie,
    getAccountCookie: getAccountCookie,
    setResponseHeaderToSetAccountCookie: setResponseHeaderToSetAccountCookie,
    setResponseHeaderToRemoveCookie: setResponseHeaderToRemoveCookie
};

function getAccountCookie(req) {
    return req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
}

function setResponseHeaderToSetAccountCookie(res, cookieValue) {
    res.cookie(ApplicationVariables.USER_ACCOUNT_COOKIE_NAME, cookieValue, {
        maxAge: ApplicationVariables.USER_ACCOUNT_COOKIE_MAX_AGE,
        path: '/',
        httpOnly: true
    });
}

function setResponseHeaderToRemoveCookie(res, cookieName) {
    res.cookie(cookieName, '', {
        expires: new Date(1).toUTCString()
    });
}

function hasAccountCookie(req) {
    return req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];
}
