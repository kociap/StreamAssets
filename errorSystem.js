const fs = require('fs');
const toString = require('./utility.js').toString;
const ApplicationVariables = require('./ApplicationVariables');


/**
 * 
 * @param {string} fileName 
 * @param {string} description 
 * @param {string} [stack]
 */
function writeFormattedLogToFile(fileName, description, stack) {
    let date = `[${new Date().toLocaleTimeString()} ${new Date().toLocaleDateString()}]`;
    fs.appendFile(`${__dirname}/${fileName}`, date + ' ' + description + (stack ? '\n\t' + stack : '') + '\n', (error) => {
        if(error) {
            console.log('An error occured while writing log\n\t' + error);
        }
    });
}

/**
 * Logs message
 * @param {string} message 
 */
let log = (message) => {
    writeFormattedLogToFile(ApplicationVariables.LOG_FILE, message);
};

/**
 * @param {Error|string} error
 * @param {string} stack
 */
log.error = (error, stack) => {
    console.log('An error occured. Please check ' + ApplicationVariables.LOG_FILE + ' for more informations.');
    if(error instanceof Error) {
        writeFormattedLogToFile(ApplicationVariables.ERROR_LOG_FILE, error.message, error.stack);
    } else {
        writeFormattedLogToFile(ApplicationVariables.ERROR_LOG_FILE, error, stack);
    }
}

/**
 * Generates stack trace
 * @param {Error|string} [message] message to better describe the problem
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
};
