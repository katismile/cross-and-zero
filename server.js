var net = require('net'),
    redis = require('redis').createClient(),
    pub = require('redis').createClient(),
    sub = require('redis').createClient(),
    sockets = {};

var server = net.createServer(function(socket) {
    console.log('connect');
    var id = Math.floor(Math.random()*1e5);

    sockets[id] = socket;
    pub.publish('sockets', id);

    socket.on('data', function(data){
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
        }

        if(typeof JSON.parse(data.toString()) === 'object') {
            redis.lpush('tasks',data);
        }
    });

}).listen(7777, function() {
    console.log('Server is running!');
});

sub.subscribe('game');
sub.subscribe('finish');

sub.on('message', function(channel, message) {
    var data = JSON.parse(message),
        socket = data.sockets[data.current];

    if(channel == "finish") {
        var socket1 = data.sockets[0];
        var socket2 = data.sockets[1];
        sockets[socket1].write(JSON.stringify(data.message));
        sockets[socket2].write(JSON.stringify(data.message));
        return;
    }

    if(channel == "game") {
        redis.lpush('tasks', JSON.stringify(data));
    }

    if(sockets[socket]) {
        sockets[socket].write(JSON.stringify(data));
    }
});