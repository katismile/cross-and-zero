var net = require('net');
var sockets = {};
var socketsPool = {};
var redis = require('redis').createClient();
var sub = require('redis').createClient();
var i = 0;
var socketId = 0;
var pings = [];
var suits = ['x', '0', 'y'];
var socketsLength;
var flag = true;

var server = net.createServer(function(socket) {
    if (Object.keys(sockets).length < 3) {
        var message = {
            setting: 'choose suit',
            data: {
                suits: suits
            }
        };
        socket.write(JSON.stringify(message));
    }
    if (Object.keys(sockets).length == 1) {
        setTimeout(start, 10000);
    }
    socket.on('data', function(data) {
        var message = data.toString();
        var requestHandler = {
            'ping': function(){
                console.log('ping');
                pings.push(socket)
            },
            'new game': function(){
                (function newGame(){
                    if(flag) {
                        var message = {
                            setting: 'choose suit',
                            data: {
                                suits: suits
                            }
                        };
                        socket.write(JSON.stringify(message));
                        flag = false;
                    }
                    else{
                        setTimeout(newGame,500)
                    }
                })()
            },
            'make move':function(){
                var parsed = JSON.parse(message);
                var id = parsed.data.id;
                var combination = parsed.data.combination;
                var combinations = parsed.data.combinations;
                var setMessage = {
                    type : 'set position',
                    data : {
                        id : id,
                        combination : combination,
                        combinations : combinations
                    }
                };
                redis.lpush('tasks', JSON.stringify(setMessage));
            },
            'choose suit': function(){
                var parsed  = JSON.parse(message);
                suits = parsed.data.suits;
                flag = true;
                socket.suit = parsed.data.suit;
                socket.gameId = i;
                socket.socketId = socketId;
                socketsPool[socketId] = socket;
                sockets[parsed.data.suit] = socketId;
                socketId++;
                if (Object.keys(sockets).length == socketsLength) {
                    setTimeout(start, 10000);
                }
            }
        };
        var parsed = JSON.parse(message);
        requestHandler[parsed["setting"]]();
    });

    socket.on('end', function() {
        if (sockets[socket.suit] != -1) {
            delete sockets[socket.suit];
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
                var message = {
                    setting: 'choose suit',
                    data: {
                        suits: suits
                    }
                };
                socketsLength = sockIds.length;
                socketsPool[sockIds[i]].write(JSON.stringify(message));
            }
        }
    }
});

function start(){
    socketsLength = Object.keys(sockets).length;
    for(var j = 0; j < Object.keys(sockets).length; j ++){
        socketsPool[sockets[Object.keys(sockets)[j]]].write(JSON.stringify({setting: 'ping'}));
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


