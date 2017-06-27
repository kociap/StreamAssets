module.exports = class User {
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