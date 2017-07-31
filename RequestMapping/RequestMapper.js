const Router = require('../Router.js').getRouter();
const ApplicationVariables = require('../ApplicationVariables.js');
const Cookies = require('./Cookies.js');

Router.get('/', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/index.html');
});

Router.get('/dashboard', (req, res) => {
    if(Cookies.hasAccountCookie(req)) {
        Cookies.setResponseHeaderToSetAccountCookie(res, Cookies.getAccountCookie(req));
        res.sendFile(ApplicationVariables.ROOT_DIR + '/dashboard.html');
    } else {
        res.redirect('/');
    }
});

Router.get('/client-library/:fileName', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/client-lib/' + req.params.fileName);
});

Router.get(/[^/]+\.html/, (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + req.path, { headers: {"Content-Type": "text/html"} });
});

Router.get('/LiveSubscribersCounter', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/widgets/LiveSubscribersCounter/index.html', { headers: {"Content-Type": "text/html"} });
});

Router.get('/LiveSubscribersCounter/script.js', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/widgets/LiveSubscribersCounter/LiveSubscribersCounter.js', { headers: {"Content-Type": "text/javascript"} });
});

Router.get(/[^/\\]+\.js/, (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + req.path, { headers: {"Content-Type": "text/javascript"} });
});

Router.get('/css/:fileName', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/CSS/' + req.params.fileName, { headers: {"Content-Type": "text/css"} });
});
