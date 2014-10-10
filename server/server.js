var net = require('net');
var sub = require('redis').createClient();
var setSuit = require('./new_game');
var requestHandler = require('./controller');
var scope = {
    sockets: {},
    socketsPool: {},
    i: 0,
    socketId: 0,
    pings: [],
    suits: ['x', '0', 'y'],
    socketsLength: 2,
    flag: true
};
net.createServer(function(socket) {
    if (Object.keys(scope.sockets).length < 3) {
        setSuit(socket, scope);
    }
    socket.on('data', function (data) {
        var message = JSON.parse(data.toString());
        var opt = {
            scope: scope,
            socket: socket,
            message: message
        };
        requestHandler[message["type"]](opt);
    });
    socket.on('end', function () {
        var opt = {
            scope: scope,
            socket: socket
        };
        requestHandler['disconnect'](opt);
    });
}).listen(7777, function () {
    console.log('Server is running!');
});
sub.subscribe('sockets commands');
sub.subscribe('to stayed user');
sub.on('message', function(channel, message) {
    if (channel == 'sockets commands') {
        var socketId = JSON.parse(message)[0];
        var messageToSocket = JSON.parse(message)[1];
        if (scope.socketsPool[socketId]) scope.socketsPool[socketId].write(JSON.stringify(messageToSocket));
    }
    else if (channel == 'to stayed user') {
        var sockIds = JSON.parse(message).socketId;
        for (var i = 0; i < sockIds.length; i++) {
            if (scope.socketsPool[sockIds[i]]) {
                scope.socketsPool[sockIds[i]].gameId = i;
                var messageToStayed = {
                    type: 'choose suit',
                    data: {
                        suits: scope.suits
                    }
                };
                scope.socketsLength = sockIds.length;
                scope.socketsPool[sockIds[i]].write(JSON.stringify(messageToStayed));
            }
        }
    }
});