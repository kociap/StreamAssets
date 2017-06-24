module.exports = function(app) {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/authentication-successful', (req, res) => {
        res.sendFile(__dirname + '/authentication-successful.html');
    });

    app.get('/authentication-error', (req, res) => {
        res.sendFile(__dirname + '/authentication-error.html');
    });

    app.get(/[^/]+\.html/, (req, res) => {
        res.sendFile(__dirname + req.path, { headers: {"Content-Type": "text/html"} });
    });

    app.get('/LiveSubscribersCounter', (req, res) => {
        res.sendFile(__dirname + '/modules/LiveSubscribersCounter/index.html');
    });

    app.get('/LiveSubscribersCounter/script.js', (req, res) => {
        res.sendFile(__dirname + '/modules/LiveSubscribersCounter/LiveSubscribersCounter.js', { headers: {"Content-Type": "text/javascript"} });
    });

    app.get(/[^/\\]+\.js/, (req, res) => {
        res.sendFile(__dirname + req.path, { headers: {"Content-Type": "text/javascript"} });
    });
}