var net = require('net');
var sockets = [];
var socketsPool = {};
var redis = require('redis').createClient();
var sub = require('redis').createClient();
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var i = 0;
var socketId = 0;

var server = net.createServer(function(socket) {
    if (sockets.length < 2) {
        socket.gameId = i;
        socket.socketId = socketId;
        socketsPool[socketId] = socket;
        sockets.push(socketId);
        socketId++;
    }
    if (sockets.length == 2) {
        (async(function() {
            var message = ['start game', [sockets, i]];
            await(redis.lpush.bind(redis, 'tasks', JSON.stringify(message)));
            sockets = [];
            i++;
        }))();
    }
    socket.on('data', function(data) {
        var message = data.toString();
        if (message.indexOf('[') !== -1) {
            var id = JSON.parse(message)[0];
            var combination = JSON.parse(message)[1];
            var combinations = JSON.parse(message)[2];
            (async(function() {
                var message = ['set position', [id, combination, combinations]];
                await(redis.lpush.bind(redis, 'tasks', JSON.stringify(message)));
            }))();
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
        (async(function() {
            var message = ['disconnect', [gameId, socketId]];
            await(redis.lpush.bind(redis, 'tasks', JSON.stringify(message)));
        }))();
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
        var sockId = JSON.parse(message).socketId;
        if (socketsPool[sockId]){
            socketsPool[sockId].gameId = i;
            sockets.push(sockId);
            if (sockets.length == 2) {
                var newmessage = ['start game', [sockets, i]];
                await(redis.lpush.bind(redis, 'tasks', JSON.stringify(newmessage)));
                sockets = [];
                i++;
            }
        }
    }

});


