let pendingPromises = {};

/**
 * Creates pending promise
 * @param {string} ID 
 * @throws Error if ID already exists
 * @returns {Promise}
 */
function createPendingPromise(ID) {
    let promiseResolve, promiseReject;
    let promise = new Promise((resolve, reject) => {
        promiseResolve = resolve;
        promiseReject = reject;
    });
    addPendingPromise(ID, promise, promiseResolve, promiseReject);
    return promise;
}

/**
 * @param {string} ID Unique ID
 * @param {Promise<string>} promise 
 * @param {function(string): void} resolve 
 * @param {function(string): void} reject 
 * @throws Error if ID already exists
 */
function addPendingPromise(ID, promise, resolve, reject) {
    if(!isUnique(ID)) {
        throw new Error("Promise with this ID already exists");
    }

    pendingPromises[ID] = {
        promise: promise,
        resolve: resolve,
        reject: reject
    }
}

/**
 * @param {string} ID 
 * @returns {Promise<string>}
 */
function getPendingPromise(ID) {
    return pendingPromises[ID] || null;
}

/**
 * Resolves promise with given ID and deletes it from pending list
 * @param {string} ID Unique ID
 * @param {*} data 
 * @returns {Promise} resolved promise
 * @throws Error if promise with ID doesn't exist
 */
function resolvePendingPromise(ID, data) {
    if(isUnique(ID)) {
        throw new Error("Promise with given ID doesn't exist");
    }

    let promise = pendingPromises[ID].promise;
    pendingPromises[ID].resolve(data);
    delete pendingPromises[ID];
    return promise;
}

/**
 * Rejects promise with given ID and deletes it from pending list
 * @param {string} ID Unique ID
 * @param {string} reason Rejection reason
 * @returns {Promise} rejected promise
 * @throws Error if promise with ID doesn't exist
 */
function rejectPendingPromise(ID, reason) {
    if(isUnique(ID)) {
        throw new Error("Promise with given ID doesn't exist");
    }

    let promise = pendingPromises[ID].promise;
    pendingPromises[ID].reject(reason);
    delete pendingPromises[ID];
    return promise;
}

/**
 * Checks whether there is already a promise with given ID
 * @param {string} ID 
 */
function isUnique(ID) {
    return !(ID in pendingPromises);
}

module.exports = {
    createPendingRequest: createPendingPromise,
    addPendingRequest: addPendingPromise,
    getPendingRequest: getPendingPromise,
    resolvePendingRequest: resolvePendingPromise,
    rejectPendingRequest: rejectPendingPromise,
    isUnique: isUnique
};