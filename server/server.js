var net = require('net');
var sockets = {};
var socketsPool = {};
var redis = require('redis').createClient();
var sub = require('redis').createClient();
var i = 0;
var socketId = 0;
var pings = [];
var suits = ['x', '0', 'y'];
var socketsLength = 2;
var flag = true;

var server = net.createServer(function(socket) {
    if (Object.keys(sockets).length < 3) {
        (function newGame () {
            if(flag) {
                socket.write(JSON.stringify({
                    type: 'choose suit',
                    data: {
                        suits: suits
                    }
                }));
                flag = false;
            }
            else{
                setTimeout (newGame,500)
            }
        })()
    }
    socket.on('data', function (data) {
        var message = JSON.parse(data.toString());
        var requestHandler = {
            'ping': function () {
                console.log('ping');
                pings.push(socket)
            },
            'new game': function () {
                (function newGame () {
                    if(flag) {
                        socket.write(JSON.stringify({
                            type: 'choose suit',
                            data: {
                                suits: suits
                            }
                        }));
                        flag = false;
                    }
                    else{
                        setTimeout (newGame,500)
                    }
                })()
            },
            'make move': function () {
                redis.lpush('tasks', JSON.stringify(message));
            },
            'choose suit': function () {
                suits = message.data.suits;
                flag = true;
                socket.suit = message.data.suit;
                socket.gameId = i;
                socket.socketId = socketId;
                socketsPool[socketId] = socket;
                sockets[message.data.suit] = socketId;
                socketId++;
                if (Object.keys(sockets).length == socketsLength) {
                    setTimeout(start, 10000);
                }
            }
        };
        requestHandler[message["type"]]();
    });

    socket.on('end', function () {
        if (sockets[socket.suit] != -1) delete sockets[socket.suit];
        delete socketsPool[socket.socketId];
        var gameId = socket.gameId;
        var socketId = socket.socketId;
        var message = {
            type : 'disconnect',
            data : {
                gameId : gameId,
                socketId : socketId
            }
        };
        redis.lpush('tasks', JSON.stringify(message));
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
        if (socketsPool[socketId]) socketsPool[socketId].write(JSON.stringify(messageToSocket));
    }
    else if (channel == 'to stayed user') {
        var sockIds = JSON.parse(message).socketId;
        for (var i = 0; i < sockIds.length; i++) {
            if (socketsPool[sockIds[i]]) {
                socketsPool[sockIds[i]].gameId = i;
                var messageToStayed = {
                    type: 'choose suit',
                    data: {
                        suits: suits
                    }
                };
                socketsLength = sockIds.length;
                socketsPool[sockIds[i]].write(JSON.stringify(messageToStayed));
            }
        }
    }
});

function start(){
    socketsLength = Object.keys(sockets).length;
    for(var j = 0; j < Object.keys(sockets).length; j ++){
        socketsPool[sockets[Object.keys(sockets)[j]]].write(JSON.stringify({type: 'ping'}));
    }
    setTimeout(function(){
        console.log('start', sockets);
        if(pings.length > 1){
            var message = {
                type : 'start game',
                data : {
                    sockets : sockets,
                    i : i
                }
            };
            redis.lpush('tasks', JSON.stringify(message));
            sockets = {};
            i++;
            pings = [];
            suits = ['x', '0', 'y'];
        }
    }, 5000)
}


