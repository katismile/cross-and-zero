var net = require('net');
var sockets = [];
var current = 0;
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
    if(sockets.length < 2){
        sockets.push(socket);
        console.log(sockets.length);
    }
    else{
        socket.destroy();
    }
    if(sockets.length == 2){
        sockets[0].write('move, ' + JSON.stringify(combinations))

    }
    socket.on('data', function(data){
        console.log('current position:' + data.toString());
        var position = data.toString().split(',');
        console.log('pos ' + position);
        if (position.length == 2){
            current = current ? 0 : 1;
            console.log('0 or 1:' + current);
            sockets[current].write('your move')
        }
    })

}).listen(7777, function() {
    console.log('Server is running!');
});

