const ApplicationVariables = require('../ApplicationVariables');
const DatabaseManager = require('../DatabaseManager');
const HttpStatus = require('../HttpStatus');
const Router = require('../Router').getRouter();

Router.get('/LiveSubscriberCounter/:widgetKey', (req, res) => {
    let widgetKey = req.params['widgetKey'];
    DatabaseManager.findUserByWidgetKey(widgetKey)
    .then((user) => {
        if(user === null) {
            res.status(HttpStatus.FORBIDDEN)
               .json({ code: HttpStatus.FORBIDDEN, message: 'Invalid widget token' });
        } else {
            res.sendFile(ApplicationVariables.ROOT_DIR + '/widgets/LiveSubscriberCounter/index.html', { headers: { 'Content-Type': 'text/html' } });
        }
    }).catch((error) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR)
           .json({ code: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Server failed to process request' });
    });
});

Router.get('/lib/js/lsc/script.js', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/widgets/LiveSubscriberCounter/index.js', { headers: { 'Content-Type': 'text/javascript' } });
});