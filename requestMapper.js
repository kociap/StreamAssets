module.exports = (app) => {
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/index.html');
    });

    app.get('/dashboard', (req, res) => {
        res.sendFile(__dirname + '/dashboard.html');
    });

    app.get('/authentication-init', (req, res) => {
        res.sendFile(__dirname + '/authentication-init.html');
    });
    
    app.get('/client-library/:fileName', (req, res) => {
        res.sendFile(__dirname + '/client-lib/' + req.params.fileName);
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