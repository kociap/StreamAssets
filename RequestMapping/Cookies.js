const ApplicationVariables = require('../ApplicationVariables.js');
const requestPromise = require('request-promise');
const ErrorSystem = require('../ErrorSystem.js');
const Base64 = require('../Base64.js');
const Utility = require('../Utility.js');

module.exports = {
    hasAccountCookie: hasAccountCookie,
    getAccountCookie: getAccountCookie,
    setResponseHeaderToSetCookie: setResponseHeaderToSetCookie,
    getNewAccountToken: getNewAccountToken,
    setResponseHeaderToRemoveCookie: setResponseHeaderToRemoveCookie
};

function getNewAccountToken() {
    return Base64.encode(String(Math.random() * Math.pow(10, Math.random() * 5)) + Utility.reverseString(String(Date.now())) + String(Math.random() * Math.pow(10, Math.random() * 5)));
}

function getAccountCookie() {
    return new Promise((resolve, reject) => {
        requestPromise('http://localhost:3000/sessions/new-session', { json: true })
        .then((response) => {
            resolve(response['Session-ID']);
        }).catch((error) => {
            ErrorSystem.log(ApplicationVariables.ERROR_LOG_FILE, 'Could not fetch new session id', ErrorSystem.stacktrace(error));
            reject(error);
        });
    });
}

function setResponseHeaderToSetCookie(res, cookieValue) {
    res.cookie(ApplicationVariables.USER_ACCOUNT_COOKIE_NAME, cookieValue, {
        maxAge: 1000 * 3600 * 24 * 7,
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
