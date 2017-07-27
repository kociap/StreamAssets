module.exports.FinalClass = class FinalClass extends Error {
    constructor(className) {
        if(new.target !== 'FinalClass') {
            throw new FinalClass(new.target);
        }
        super("Final class " + className + " may not be extended!");
    }
}

module.exports.AbstractClass = class AbstractClass extends Error {
    constructor(className) {
        if(new.target !== 'AbstractClass') {
            throw new FinalClass(new.target);
        }
        super(className + ' is an abstract class and may not be constructed!');
    }
}


module.exports.DatabaseError = class DatabaseError extends Error {
    constructor(message) {
        if(new.target === 'DatabaseError') {
            throw new AbstractClass('DatabaseError');
        }

        super(message);
    }
}

module.exports.DatabaseAccessFailure = class DatabaseAccessFailure extends DatabaseError {
    constructor(message) {
        super(message);
    }
}

module.exports.NullField = class NullField extends DatabaseError {
    constructor(fieldName) {
        super('Field ' + fieldName + 'was declared as "not null" but null was given!');
    }
}

module.exports.EntityDoesNotExist = class EntityDoesNotExist extends DatabaseError {
    constructor() {
        super('Requested entity doesn\'t exist!');
    }
}

module.exports.RequestError = class RequestError extends Error {
    constructor(message) {
        super(message);
    }
};

module.exports.AuthorizationError = class AuthorizationError extends RequestError {
    constructor(message) {
        super(message);
    }
};

module.exports.RefreshError = class RefreshError extends RequestError {
    constructor(message) {
        super(message);
    }
}

module.exports.UnauthorizedWidgetKey = class UnauthorizedWidgetKey extends RequestError {
    constructor(widgetKey) {
        super(widgetKey + ' is not an authorized key!');
    }
}

module.exports.RequiredArgumentNotSupplied = class RequiredArgumentNotSupplied extends Error {
    constructor(argumentName) {
        super('The required field ' + argumentName + ' was not supplied!');
    }
}

module.exports.WidgetError = class WidgetError extends Error {
    constructor(message) {
        if(new.target === 'WidgetError') {
            throw new AbstractClass('WidgetError');
        }

        super(message);
    }
}

module.exports.UnexpectedDisconnection = class UnexpectedDisconnection extends WidgetError {
    constructor(message) {
        super(message);
    }
}
