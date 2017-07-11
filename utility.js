function toString(obj) {
    if(typeof obj === 'object') {
        return JSON.stringify(obj);
    } else {
        return String(obj);
    }
}

/**
 * Builds uri with given base request uri and parameters
 * @param {string} requestURI 
 * @param {object} params 
 * @returns {string}
 */
function buildURI(requestURI, params) {
    let requestParams = [];
    for (let key of Object.keys(params)) {
        requestParams.push(`${key}=${params[key]}`);
    }
    return requestURI + '?' + requestParams.join('&');
}

function reverseString(str) {
    return str.split('').reverse().join('');
}

module.exports = {
    toString: toString,
    buildURI: buildURI,
    reverseString: reverseString
};