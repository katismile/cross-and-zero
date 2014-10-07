var net = require('net');
var sockets = [];
var socketsPool = {};
var redis = require('redis').createClient();
var sub = require('redis').createClient();
var i = 0;
var socketId = 0;
var pings = [];
var socketsLength;
var server = net.createServer(function(socket) {
    if (sockets.length < 3) {
        socket.gameId = i;
        socket.socketId = socketId;
        socketsPool[socketId] = socket;
        sockets.push(socketId);
        socketId++;
    }
    if (sockets.length === 3) {
        start(socket);
    }
    socket.on('data', function(data) {
        var message = data.toString();
        if (message === 'ping') {
            console.log('ping');
            pings.push(socket);
        }
        else if(message === 'new game'){
            sockets.push(socket.socketId);
            console.log(sockets);
            if (sockets.length === socketsLength) {
                start();
            }
        }
        else if (message.indexOf('[') !== -1) {
            var id = JSON.parse(message)[0];
            var combination = JSON.parse(message)[1];
            var combinations = JSON.parse(message)[2];
            var setMessage = {
                type : 'set position',
                data : {
                    id : id,
                    combination : combination,
                    combinations : combinations
                }
            };
            redis.lpush('tasks', JSON.stringify(setMessage));
        }
    });

    socket.on('end', function() {
        if (sockets.indexOf(socket.socketId) != -1) {
            var index = sockets.indexOf(socket);
            sockets.splice(index, 1);
        }
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
}).listen(7777, function() {
    console.log('Server is running!');
});

sub.subscribe('sockets commands');
sub.subscribe('to stayed user');
sub.on('message', function(channel, message) {
    if (channel == 'sockets commands') {
        var socketId = JSON.parse(message)[0];
        var messageToSocket = JSON.parse(message)[1];
        if (socketsPool[socketId]){
            socketsPool[socketId].write(JSON.stringify(messageToSocket));
        }
    }
    else if (channel == 'to stayed user') {
        var sockIds = JSON.parse(message).socketId;
        for(var i = 0; i < sockIds.length; i++){
            if (socketsPool[sockIds[i]]){
                socketsPool[sockIds[i]].gameId = i;
                sockets.push(sockIds[i]);
                if (sockets.length > 1) {
                    start()
                }
            }
        }
    }
});

function start(){
    socketsLength = sockets.length;
    for(var j = 0; j < sockets.length; j ++){
        socketsPool[sockets[j]].write(JSON.stringify({setting: 'ping'}));
    }
    setTimeout(function(){
        console.log('start');
        if(pings.length == 3 || pings.length == 2){
            var message = {
                type : 'start game',
                data : {
                    sockets : sockets,
                    i : i
                }
            };
            redis.lpush('tasks', JSON.stringify(message));
            sockets = [];
            i++;
            pings = [];
        }
    }, 5000)
}