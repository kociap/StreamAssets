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

    let widgetKey = location.href.split('/').pop();
    console.log(widgetKey);

    const streamAssets = new io(`/widgets?token=${widgetKey}`);

    streamAssets.on('statistics', (statistics) => {
        console.log(statistics);
    });

})();