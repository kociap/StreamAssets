const TokenData = require('./TokenData.js');
module.exports = class Session {
    /**
     * @param {object} data
     */
    constructor(data, privateData) {
        this.data = data || {};
        this.privateData = privateData || {};
    }

    setData(key, value) {
        this.data[key] = value;
    }

    deleteData(key) {
        delete this.data[key];
    }

    getData(key) {
        return this.data[key] || null;
    }

    getAllData() {
        return this.data;
    }

    setPrivateData(key, value) {
        this.privateData[key] = value;
    }

    deletePrivateData(key) {
        delete this.privateData[key];
    }

    getPrivateData(key) {
        return this.privateData[key] || null;
    }

    getAllPrivateData() {
        return this.privateData;
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