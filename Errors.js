class FinalClass extends Error {
    constructor(className) {
        if(new.target !== 'FinalClass') {
            throw new FinalClass(new.target);
        }
        super("Final class " + className + " may not be extended!");
    }
}
module.exports.FinalClass = FinalClass;

class AbstractClass extends Error {
    constructor(className) {
        if(new.target !== 'AbstractClass') {
            throw new FinalClass(new.target);
        }
        super(className + ' is an abstract class and may not be constructed!');
    }
}
module.exports.AbstractClass = AbstractClass;

class DatabaseError extends Error {
    constructor(message) {
        if(new.target === 'DatabaseError') {
            throw new AbstractClass('DatabaseError');
        }

        super(message);
    }
}
module.exports.DatabaseError = DatabaseError;

class DatabaseAccessFailure extends DatabaseError {
    constructor(message) {
        super(message);
    }
}
module.exports.DatabaseAccessFailure = DatabaseAccessFailure;

class NullField extends DatabaseError {
    constructor(fieldName) {
        super('Field ' + fieldName + 'was declared as "not null" but null was given!');
    }
}
module.exports.NullField = NullField;

class EntityDoesNotExist extends DatabaseError {
    constructor() {
        super('Requested entity doesn\'t exist!');
    }
}
module.exports.EntityDoesNotExist = EntityDoesNotExist;

class RequestError extends Error {
    constructor(message) {
        super(message);
    }
};
module.exports.RequestError = RequestError;

class AuthorizationError extends RequestError {
    constructor(message) {
        super(message);
    }
};
module.exports.AuthorizationError = AuthorizationError;

class RefreshError extends RequestError {
    constructor(message) {
        super(message);
    }
}
module.exports.RefreshError = RefreshError;

class UnauthorizedWidgetKey extends RequestError {
    constructor(widgetKey) {
        super(widgetKey + ' is not an authorized key!');
    }
}
module.exports.UnauthorizedWidgetKey = UnauthorizedWidgetKey;

class RequiredArgumentNotSupplied extends Error {
    constructor(argumentName) {
        super('The required field ' + argumentName + ' was not supplied!');
    }
}
module.exports.RequiredArgumentNotSupplied = RequiredArgumentNotSupplied;

class WidgetError extends Error {
    constructor(message) {
        if(new.target === 'WidgetError') {
            throw new AbstractClass('WidgetError');
        }

        super(message);
    }
}
module.exports.WidgetError = WidgetError;

class UnexpectedDisconnection extends WidgetError {
    constructor(message) {
        super(message);
    }
}
module.exports.UnexpectedDisconnection = UnexpectedDisconnection;
