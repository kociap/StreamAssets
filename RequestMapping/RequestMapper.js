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

Router.get('/css/:fileName', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/CSS/' + req.params.fileName, { headers: {"Content-Type": "text/css"} });
});
