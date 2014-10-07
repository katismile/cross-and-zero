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

    if(store.sockets.length < 3) {
        store.sockets.push(id);
    }

    if(store.sockets.length == 3) {
        store.gameId = gameId;

        start(socket, function(err, res) {
            if(err) throw err;

            store.sockets = [];
            checkPing = [];
            gameId++;
        });
    }

    socket.on('data', function(data){

        if(typeof JSON.parse(data.toString()) === 'string') {
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
        });
    });

}).listen(7777, function() {
    console.log('Server is running!');
});


sub.subscribe('game');
sub.subscribe('finish');
sub.subscribe('restart');
sub.subscribe('delete');

sub.on('message', function(channel, message) {
    var data = JSON.parse(message);

    if (channel == 'restart') {
        sockets[data.sockets[0]].gameId = gameId;

        for(var t = 0; t < data.sockets.length; t++) {
            store.sockets.push(data.sockets[t]);
        }

        if(store.sockets.length == 3) {
            start(mainSocket, function(err, res) {
                if(err) throw err;

                store.sockets = [];
                checkPing = [];
                gameId++;
                console.log('store ' + store.sockets + '  ' + store.sockets.length);
            });
        }
    } else if (channel == 'delete') {

        if(store.sockets.indexOf(data.socket) != -1) {
            var index = store.sockets.indexOf(data.socket);
            store.sockets.splice(index, 1);
        }
    } else {
        socket = data.sockets[data.current];

        if(channel == "finish") {

            for(var i = 0; i < data.sockets.length; i++) {
                //sockets[data.sockets[i]].write(JSON.stringify(data.message));

                if(store.sockets.indexOf(data.sockets[i]) == -1) {
                    store.sockets.push(data.sockets[i]);
                }
            }
            start(mainSocket, function(err, res) {
                if(err) throw err;

                store.sockets = [];
                checkPing = [];
                gameId++;
            });
            return;
        }

        if(channel == "game") {
            redis.lpush('tasks', JSON.stringify(data));
        }

        if(sockets[socket]) {
            sockets[socket].write(JSON.stringify(data));
        }
    }

});

function start(socket, next) {

    for(var i = 0; i < store.sockets.length; i++) {
        var index = store.sockets[i];
        sockets[index].write(JSON.stringify('ping'));
    }

    socket.setTimeout(5000,function(){
        if(checkPing.length == 3) {
            console.log('Ok length of players');
            var obj = {
                action: "start",
                data: store
            };

            redis.lpush('tasks', JSON.stringify(obj), function(err, res) {
                if(err) throw err;
            });
            next(null);
        }
    });
}