var net = require('net');
sockets = [];

var combinations = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
];


var server = net.createServer(function(socket) {
    console.log('connect');
    socket.write('Welcome');

    if(sockets.length < 2) {
        sockets.push(socket);
    } else {
        socket.destroy();
    }

    if(sockets.length == 2) {
        sockets[0].write('START GAME');
        sockets[1].write('START GAME');
        var combinationsV = JSON.stringify(combinations);
        sockets[0].write('move ' + combinationsV);
    }

}).listen(7777, function() {
    console.log('Server is running!');
});