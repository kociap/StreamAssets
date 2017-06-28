module.exports = class User {
    /**
     * @param {string} channelID 
     * @param {string|null} widgetKey 
     * @param {TokenData|null} tokenData 
     */
    constructor(channelID, widgetKey, tokenData) {
        this.channelID = channelID || null;
        this.widgetKey = widgetKey || null;
        this.tokenData = tokenData || null;
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
}