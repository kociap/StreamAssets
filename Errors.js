class FinalClass extends Error {
    constructor(className) {
        if(new.target !== 'FinalClass') {
            throw new FinalClass(new.target);
        }
        super("Final class " + className + " may not be extended!");
    }
}

class AbstractClass extends Error {
    constructor(className) {
        if(new.target !== 'AbstractClass') {
            throw new FinalClass(new.target);
        }
        super(className + ' is an abstract class and may not be constructed!');
    }
}


class DatabaseError extends Error {
    constructor(message) {
        if(new.target === 'DatabaseError') {
            throw new AbstractClass('DatabaseError');
        }

        super(message);
    }
}

class DatabaseAccessFailure extends DatabaseError {
    constructor(message) {
        super(message);
    }
}

class NullField extends DatabaseError {
    constructor(fieldName) {
        super('Field ' + fieldName + 'was declared as "not null" but null was given!');
    }
}

class EntityDoesNotExist extends DatabaseError {
    constructor() {
        super('Requested entity doesn\'t exist!');
    }
}

class RequestError extends Error {
    constructor(message) {
        super(message);
    }
};

class AuthorizationError extends RequestError {
    constructor(message) {
        super(message);
    }
};

class UnauthorizedWidgetKey extends RequestError {
    constructor(widgetKey) {
        super(widgetKey + ' is not an authorized key!');
    }
}

class RequiredArgumentNotSupplied extends Error {
    constructor(argumentName) {
        super('The required field ' + argumentName + ' was not supplied!');
    }
}

class WidgetError extends Error {
    constructor(message) {
        if(new.target === 'WidgetError') {
            throw new AbstractClass('WidgetError');
        }

        super(message);
    }
}

class UnexpectedDisconnection extends WidgetError {
    constructor(message) {
        super(message);
    }
}

module.exports = {
    FinalClass: FinalClass,
    AbstractClass: AbstractClass,
    DatabaseError: DatabaseError,
    DatabaseAccessFailure: DatabaseAccessFailure,
    NullField: NullField,
    EntityDoesNotExist: EntityDoesNotExist,
    RequestError: RequestError,
    AuthorizationError: AuthorizationError,
    UnauthorizedWidgetKey: UnauthorizedWidgetKey,
    RequiredArgumentNotSupplied: RequiredArgumentNotSupplied,
    WidgetError: WidgetError,
    UnexpectedDisconnection: UnexpectedDisconnection
};
