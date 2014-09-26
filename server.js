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
    socket.on('data', function (data) {
        if(combinations.length > 0){
            console.log('data' + data.toString());
            var currentData = JSON.parse(data.toString());
            var position = currentData[0];
            combinations = currentData[1];
            console.log(position.length, combinations);
            if (position.length == 2) {
                current = current ? 0 : 1;
                console.log('current:' + current);
                console.log('pos:' + position);
                console.log(combinations);
                sockets[current].write('move, ' + JSON.stringify(combinations))
            }
        }
    })




}).listen(7777, function() {
    console.log('Server is running!');
});

