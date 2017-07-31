let app = null;
let RouterModule = {
    setRouter: (router) => {
        app = router;
        return RouterModule;
    },
    getRouter: () => {
        return app;
    }
}

module.exports = RouterModule;