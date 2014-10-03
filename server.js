var net = require('net'),
    redis = require('redis').createClient(),
    pub = require('redis').createClient(),
    sub = require('redis').createClient(),
    sockets = {};

sub.subscribe('game');

sub.on('message', function(channel, message) {
    var data = JSON.parse(message);
    data.current =  data.current ? 0 : 1;

    var socket = data.sockets[data.current];

    if(data.action) {
        redis.lpush('tasks', JSON.stringify(data));
    }

    if(sockets[socket]) {
        sockets[socket].write(JSON.stringify(data));
    }

});

var server = net.createServer(function(socket) {
    console.log('connect');
    var id = Math.floor(Math.random()*1e5);

    sockets[id] = socket;
    pub.publish('sockets', id);

    socket.on('data', function(data){
        console.log('fffff');
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
        }
    });
}).listen(7777, function() {
    console.log('Server is running!');
});