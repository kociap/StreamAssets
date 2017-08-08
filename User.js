const Errors = require('./Errors.js');

module.exports = class User {
    /**
     * @param {string} channelID
     * @param {string|null} [widgetKey]
     * @param {TokenData|null} [tokenData]
     * @param {string|null} [accountToken]
     */
    constructor(channelID, tokenData, widgetKey, accountToken) {
        if(!channelID) {
            throw new Errors.RequiredArgumentNotSupplied('channelID');
        }
        
        this.channelID = channelID;
        this.tokenData = tokenData || null;
        this.widgetKey = widgetKey || null;
        this.accountToken = accountToken || null;
    }

    setChannelID(channelID) {
        this.channelID = channelID;
    }

    getChannelID() {
        return this.channelID;
    }

    setWidgetKey(widgetKey) {
        this.widgetKey = widgetKey;
    }

    getWidgetKey() {
        return this.widgetKey;
    }

    setTokenData(tokenData) {
        this.tokenData = tokenData;
    }

    getTokenData() {
        return this.tokenData;
    }

    setAccoutToken(accountToken) {
        this.accountToken = accountToken;
    }

    getAccountToken() {
        return this.accountToken;
    }
}