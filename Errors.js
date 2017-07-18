module.exports = {
    DatabaseError: DatabaseError,
    NullFieldError: NullFieldError,
    RequestError: RequestError,
    AuthorizationError: AuthorizationError,
    RequiredArgumentNotSuppliedError: RequiredArgumentNotSuppliedError
};

class DatabaseError extends Error {
    constructor(message) {
        super(message);
        this.errorType = 'Database';
    }
}

class NullFieldError extends DatabaseError {
    constructor(fieldName) {
        super('Field ' + fieldName + 'was declared as "not null" but null was given');
        this.errorType = 'NullField';
    }
}

class RequestError extends Error {
    constructor(message) {
        super(message);
        this.errorType = 'Request';
    }
};

class AuthorizationError extends RequestError {
    constructor(message) {
        super(message);
        this.errorType = 'Authorization';
    }
};

class RequiredArgumentNotSuppliedError extends Error {
    constructor(argumentName) {
        super('The required field ' + argumentName + ' was not supplied');
        this.errorType = 'RequiredArgumentNotSupplied';
    }
}