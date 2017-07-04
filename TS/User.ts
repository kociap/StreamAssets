import { TokenData } from './TokenData';

export class User {
    private channelID: string;
    private widgetKey: string|null;
    private tokenData: TokenData|null;

    constructor(channelID: string, widgetKey?: string, tokenData?: TokenData) {
        this.channelID = channelID;
        this.widgetKey = widgetKey || null;
        this.tokenData = tokenData || null;
    }

    setChannelID(channelID: string) {
        this.channelID = channelID;
    }

    getChannelID(): string {
        return this.channelID;
    }

    setWidgetKey(widgetKey: string) {
        this.widgetKey = widgetKey;
    }

    getWidgetKey(): string|null {
        return this.widgetKey;
    }

    setTokenData(tokenData: TokenData|null) {
        this.tokenData = tokenData;
    }

    getTokenData(): TokenData|null {
        return this.tokenData;
    }
}