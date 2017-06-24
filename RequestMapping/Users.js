module.exports = (app) => {
    app.post('/users/:id/tokens', (req, res) => {
        res.sendStatus(200);
    });
};