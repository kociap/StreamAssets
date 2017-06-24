const TokenData = require('./TokenData.js');
module.exports = class Session {
    /**
     * @param {object} data
     */
    constructor(data) {
        this.data = data || {};
    }

    setData(key, value) {
        this.data[key] = value;
    }

    getData(key) {
        return this.data[key] || null;
    }

    /**
     * @param {string[]} keys
     */
    getDataByKeys(keys) {
        let data = {};
        for(let key of keys) {
            data[key] = this.data[key] || null;
        }
        return data;
    }
}