var net = require('net');

var server = net.createServer(function(socket) {
    console.log('connect');
    getAccess(socket);
    start(socket);
    socket.write('Welcome');

    if(numberOfPlayers) {
        socket.write('START');
    }

}).listen(7777, function() {
    console.log('Server is running!');
});

function getAccess(socket) {
    server.getConnections(function(err, count) {
        console.log("Players " + count);
        if(count > 2) {
            socket.destroy();
        }
    });
}

function start() {
    server.getConnections(function(err, count) {
        if(count == 2) {
            socket.write('START');
        }
    });
}