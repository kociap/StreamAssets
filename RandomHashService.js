const Base64 = require('./Base64.js');

function generateWidgetKey() {
    return Base64.encode(String(Math.random() * Math.pow(10, Math.random() * 5)) + String(Date.now()).slice(5).split('').join(String(Math.random() * 9 | 0)) + String(Math.random() * Math.pow(10, Math.random() * 5)));
}

module.exports = {
    generateWidgetKey: generateWidgetKey
}