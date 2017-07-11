module.exports = class TokenData {
    constructor(accessToken, refreshToken, tokenType, expiresIn) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenType = tokenType;
        this.expirationDate = Date.now() + Number(expiresIn);
    }
}