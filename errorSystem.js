const fs = require('fs');
const toString = require('./utility.js').toString;

/**
 * Logs error log to given file
 * @param {string} fileName 
 * @param {string} description 
 * @param {string} message 
 */
let log = (fileName, description, message) => {
    console.log('An error occured. Please check ' + fileName + ' for more informations.');
    let date = `[${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}]`;
    fs.appendFile(`${__dirname}/${fileName}`, date + ' ' + description + '\n\t' + message + '\n', (error) => {
        if(error) {
            console.log('Error at writeErrorLog at GoogleAPIAuthorization.js: Could not write error log\n\t' + error);
        }
    });
};

/**
 * Generates stack trace
 * @param {string} [message] message to better describe the problem
 * @returns {string}
 */
let stacktrace = (message) => {
    if(message instanceof Error) {
        return message.stack;
    }
    
    return new Error(toString(message)).stack.replace(/(\t+|[ ]+)at.+?\(.+?\)\n/, '');
};

module.exports = {
    log: log,
    stacktrace: stacktrace
}