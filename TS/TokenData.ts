export class TokenData {
    public accessToken: string;
    public refreshToken: string;
    public tokenType: string;
    public expirationDate: number;

    constructor(accessToken: string, refreshToken: string, tokenType: string, expiresIn: string|number) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expirationDate = Date.now() + Number(expiresIn);
    }
}