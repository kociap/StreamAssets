/**
 * Error thrown when another class tries to
 *    extend final class
 */
class FinalClass extends Error {
    constructor(className) {
        if(new.target !== 'FinalClass') {
            throw new FinalClass(new.target);
        }
        super("Final class " + className + " may not be extended!");
    }
}
module.exports.FinalClass = FinalClass;

/**
 * Error thrown when there was an attempt to instantiate
 *    an abstract class
 */
class AbstractClass extends Error {
    constructor(className) {
        if(new.target !== 'AbstractClass') {
            throw new FinalClass(new.target);
        }
        super(className + ' is an abstract class and may not be constructed!');
    }
}
module.exports.AbstractClass = AbstractClass;

/**
 * Generic error class for database.
 * Abstract class
 */
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

class GoogleAPIAuthorizationError extends RequestError {
    constructor(message) {
        super(message);
    }
};
module.exports.GoogleAPIAuthorizationError = GoogleAPIAuthorizationError;

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

class UnauthorizedAccess extends Error {
    constructor(message) {
        super(message);
    }
}
module.exports.UnauthorizedAccess = UnauthorizedAccess;

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

class InvalidURI extends Error {
    constructor(message) {
        super(message);
    }
}
module.exports.InvalidURI = InvalidURI;

class MissingQueryParameter extends InvalidURI {
    constructor(queryParamName) {
        super('Query parameter ' + queryParamName + ' is missing!');
    }
}
module.exports.MissingQueryParameter = MissingQueryParameter;
