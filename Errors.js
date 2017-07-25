class FinalClass extends Error {
    constructor(className) {
        if(new.target !== 'FinalClass') {
            throw new FinalClass(new.target);
        }
        super("Final class " + className + " may not be extended!");
    }
}

class AbstractClass extends Error {
    constructor(message) {
        if(new.target !== 'AbstractClass') {
            throw new FinalClass(new.target);
        }
        super(message);
    }
}


class Database extends Error {
    constructor(message) {
        if(new.target === 'Database') {
            throw new AbstractClass('Database is an abstract class and may not be constructed!');
        }

        super(message);
    }
}

class DatabaseAccessFailure extends Database {
    constructor(message) {
        super(message);
    }
}

class NullField extends Database {
    constructor(fieldName) {
        super('Field ' + fieldName + 'was declared as "not null" but null was given');
    }
}

class EntityDoesNotExist extends Database {
    constructor() {
        super('Requested entity doesn\'t exist');
    }
}

class Request extends Error {
    constructor(message) {
        super(message);
    }
};

class Authorization extends Request {
    constructor(message) {
        super(message);
    }
};

class RequiredArgumentNotSupplied extends Error {
    constructor(argumentName) {
        super('The required field ' + argumentName + ' was not supplied');
    }
}

module.exports = {
    FinalClass: FinalClass,
    AbstractClass: AbstractClass,
    Database: Database,
    DatabaseAccessFailure: DatabaseAccessFailure,
    NullField: NullField,
    EntityDoesNotExist: EntityDoesNotExist,
    Request: Request,
    Authorization: Authorization,
    RequiredArgumentNotSupplied: RequiredArgumentNotSupplied
};
