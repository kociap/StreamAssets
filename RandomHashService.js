const Base64 = require('./Base64.js');

function swap(array, inx1, inx2) {
    let tmp = array[inx1];
    array[inx1] = array[inx2];
    array[inx2] = tmp;
}

function shuffle(array) {
    for(let i = array.length - 1; i > 0; --i) {
        swap(array, i, Math.random() * (i - 1) | 0);
    }

    return array;
}

function generateWidgetKey() {
    return Base64.encode(String(Math.random() * Math.pow(10, Math.random() * 5)) + String(Date.now()).slice(5).split('').join(String(Math.random() * 9 | 0)) + String(Math.random() * Math.pow(10, Math.random() * 5)));
}

function generateUserToken() {
    return shuffle(Base64.encode(String(Math.random() * Math.pow(10, Math.random() * 5)) + String(Date.now()).slice(5).split('').join(String(Math.random() * 9 | 0)) + String(Math.random() * Math.pow(10, Math.random() * 5))).split('')).join('');
}

module.exports = {
    generateUserToken: generateUserToken,
    generateWidgetKey: generateWidgetKey
}