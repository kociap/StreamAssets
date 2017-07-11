let app = null;
module.exports = {
    setRouter: (router) => {
        app = router;
    },
    getRouter: () => {
        return app;
    }
}