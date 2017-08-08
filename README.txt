Server emits the following events to all connected to it client sockets:
1. statistics - sends channel statistics
2. new-followers - sends the newest followers


TO DO:
1. [Done] Implement sessions or something like that
2. Rebuild requestAuthenticationCode in GoogleAPIAuthorization so that it doesn't depend on socket
3. Improve ID generation for sessions
4. Improve safety and efficiency of timeout promises in PendingRequestService