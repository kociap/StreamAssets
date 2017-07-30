module.exports = {
    ERROR_LOG_FILE: 'error_log.txt',
    ROOT_DIR: __dirname,
    
    SERVER_PORT: 3000,
    DOMAIN: 'http://localhost:3000',
    DOMAIN_NO_PROTOCOL: 'localhost:3000',
    
    USER_ACCOUNT_COOKIE_NAME: 'UTK-A',
    USER_ACCOUNT_COOKIE_MAX_AGE: 1000 * 3600 * 24 * 2,

    YOUTUBE_OAUTH_REDIRECT_URI: 'http://localhost:3000/youtube/auth',
    YOUTUBE_API_SCOPE: 'https://www.googleapis.com/auth/youtube',
    YOUTUBE_API_KEY: 'AIzaSyAsIVah4N_GyWEW1j6j1e9uNWgTY9PrUa0',
    CLIENT_ID: '1095826790210-nioob90omr0ibu8fu249jkgqjktqgh7u.apps.googleusercontent.com',
    CLIENT_SECRET: 'fFQdWdHZ6rxxqeFG0yXlVHBA',

    DATA_REQUEST_TIMEOUT: 500
};
