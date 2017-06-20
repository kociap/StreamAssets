(() => {
    'use strict';

    const socket = new io();
    socket.on('chat-update', (informations) => {
        console.log(informations);
    });
    
})();