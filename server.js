var net = require('net');
sockets = [];

var server = net.createServer(function(socket) {
    console.log('connect');
    socket.write('Welcome');

    if(sockets.length < 2) {
        sockets.push(socket);
    } else {
        socket.destroy();
    }
    console.log(sockets);
    if(sockets.length == 2) {
        for(var i = 0; i < sockets.length; i++) {
            sockets[i].write('START GAME');
            sockets[i].write('Cross move');
        }
    }
}).listen(7777, function() {
    console.log('Server is running!');
});