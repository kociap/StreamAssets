class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.errorType = 'Database Error';
    }
}

class RequestError extends Error {
    constructor(message) {
        super(message);
        this.errorType = 'Request Error';
    }
};

class AuthorizationError extends RequestError {
    constructor(message) {
        super(message);
        this.errorType = 'Authorization Error';
    }
};

module.exports = {
    DatabaseError: DatabaseError,
    RequestError: RequestError,
    AuthorizationError: AuthorizationError
};