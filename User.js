const Errors = require('./Errors.js');

module.exports = class User {
    /**
     * @param {string} channelID
     * @param {string|null} [widgetKey]
     * @param {TokenData|null} [tokenData]
     */
    constructor(channelID, tokenData, widgetKey) {
        if(!channelID) {
            throw new Errors.RequiredArgumentNotSupplied('channelID');
        }
        
        this.channelID = channelID;
        this.tokenData = tokenData || null;
        this.widgetKey = widgetKey || null;
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

    copyAssign(user) {
        this.channelID = user.channelID;
        this.widgetKey = user.widgetKey;
        this.tokenData = user.tokenData;
    }

    equals(user) {
        return this.channelID === user.channelID && this.widgetKey === user.widgetKey && this.tokenData === user.tokenData;
    }
}