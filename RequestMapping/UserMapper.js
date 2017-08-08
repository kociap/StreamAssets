const Router = require('../Router').getRouter();
const ApplicationVariables = require('../ApplicationVariables');
const DatabaseManager = require('../DatabaseManager');
const HttpStatus = require('../HttpStatus');
const Errors = require('../Errors');

Router.get('/ca/users/props/widgetKey', (req, res) => {
    const accountToken = req.cookies[ApplicationVariables.USER_ACCOUNT_COOKIE_NAME];

    DatabaseManager.findUserByAccountToken(accountToken)
    .then((user) => {
        if(user !== null) {
            res.status(HttpStatus.OK)
               .send(user.widgetKey);
        } else {
            throw new Errors.UnauthorizedAccess();
        }
    }).catch((error) => {
        if(error instanceof Errors.UnauthorizedAccess) {
            res.status(HttpStatus.FORBIDDEN)
               .send(error);
        } else {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR)
               .send(error);
        }
    });
});