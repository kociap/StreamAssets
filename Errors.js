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

class EntityDoesNotExist extends DatabaseError {
    constructor() {
        super('Requested entity doesn\'t exist');
        this.errorType = 'EntityDoesNotExist';
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

module.exports = {
    DatabaseError: DatabaseError,
    NullFieldError: NullFieldError,
    RequestError: RequestError,
    AuthorizationError: AuthorizationError,
    RequiredArgumentNotSuppliedError: RequiredArgumentNotSuppliedError,
    EntityDoesNotExist: EntityDoesNotExist
};
