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
var field = [[],[],[]];

var server = net.createServer(function(socket) {
    console.log('connect');
    if(sockets.length < 2){
        sockets.push(socket);
    } else{
        socket.destroy();
    }
    if(sockets.length == 2){
        sockets[0].write('move, ' + JSON.stringify(combinations))
    }
    socket.on('data', function (data) {
        //while(combinations) {
        var incomming = data.toString();
        var separetor = incomming.indexOf(']');
        var pos = incomming.slice(0, separetor + 1);
        var position = JSON.parse(pos);
        var comb = incomming.slice(separetor + 1, incomming.length);
        combinations = JSON.parse(comb);
        console.log(combinations);
        if (position.length == 2) {
            //
            setPosition(current, field, comb);
            //
            current = current ? 0 : 1;
            console.log('current:' + current);
            console.log('pos:' + position);
            console.log(combinations);
            sockets[current].write('move, ' + JSON.stringify(combinations))
        }
    })
}).listen(7777, function() {
    console.log('Server is running!');
});

function setPosition(current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];
    field[position1][position2] = current;
}