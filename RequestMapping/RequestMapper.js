const app = require('../Router.js').getRouter();
const ApplicationVariables = require('../ApplicationVariables.js');

app.get('/', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/index.html');
});

app.get('/dashboard', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/dashboard.html');
});

app.get('/authentication-init', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/authentication-init.html');
});

app.get('/client-library/:fileName', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/client-lib/' + req.params.fileName);
});

app.get(/[^/]+\.html/, (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + req.path, { headers: {"Content-Type": "text/html"} });
});

app.get('/LiveSubscribersCounter', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/modules/LiveSubscribersCounter/index.html');
});

app.get('/LiveSubscribersCounter/script.js', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/modules/LiveSubscribersCounter/LiveSubscribersCounter.js', { headers: {"Content-Type": "text/javascript"} });
});

app.get(/[^/\\]+\.js/, (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + req.path, { headers: {"Content-Type": "text/javascript"} });
});

app.get('/css/:fileName', (req, res) => {
    res.sendFile(ApplicationVariables.ROOT_DIR + '/CSS/' + req.params.fileName);
});