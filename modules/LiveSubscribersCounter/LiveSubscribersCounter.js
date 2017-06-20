(() => {
    'use strict';

    /**
     * Displays subscribers count
     * @param {Number} subscribersCount
     * @returns {void}
     */
    let displaySubscribersCount = (subscribersCount) => {
        document.querySelector('#subscribers-count').innerHTML = subscribersCount;
    }

    let userID = 'abcdefghijklmnn';

    const streamAssets = new io();
    streamAssets.on('connect', () => {
        streamAssets.emit('youtube-room', userID);
    });

    streamAssets.on('subscribers', (subscribers) => {
        console.log(subscribers);
        displaySubscribersCount(subscribers);
    });

})();