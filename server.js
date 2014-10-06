var net = require('net'),
    redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    sockets = {},
    store = {},
    gameId = 0,
    checkPing = [],
    mainSocket;

    store.sockets = [];

var server = net.createServer(function(socket) {
    console.log('connect');
    mainSocket = socket;

    var id = Math.floor(Math.random()*1e5);

    socket.gameId = gameId;
    socket.id = id;
    sockets[id] = socket;

    if(store.sockets.length < 2) {
        store.sockets.push(id);
    }
    if(store.sockets.length == 2) {
        store.gameId = gameId;
        start(socket);
    }

    socket.on('data', function(data){
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
            if(JSON.parse(data.toString()).toLowerCase() == 'ok') {
                checkPing.push(JSON.parse(data.toString()));
            }
        }

        if(typeof JSON.parse(data.toString()) === 'object') {
            redis.lpush('tasks', data);
        }
    });
    socket.on('end', function(){

        var obj = {
            action: "disconnect",
            data: {
                gameId: socket.gameId,
                socketId: socket.id
            }
        };
        redis.lpush('tasks', JSON.stringify(obj), function(err, res) {
            if(err) throw err;
        })

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
        console.log(mainSocket);

        store.sockets.push(socket1);
        store.sockets.push(socket2);

        start(mainSocket);
        return;
    }

    if(channel == "game") {
        redis.lpush('tasks', JSON.stringify(data));
    }

    if(sockets[socket]) {
        sockets[socket].write(JSON.stringify(data));
    }
});

function start(socket) {

    for(var i = 0; i < store.sockets.length; i++) {
        var index = store.sockets[i];
        sockets[index].write(JSON.stringify('ping'));
    }

    socket.setTimeout(5000,function(){
        if(checkPing.length == 2) {
            console.log('Ok length of players');
            var obj = {
                action: "start",
                data: store
            };

            redis.lpush('tasks', JSON.stringify(obj), function(err, res) {
                if(err) throw err;
                console.log(res);
            });
            store.sockets = [];
            gameId++;
            checkPing = [];
        }
    });
}