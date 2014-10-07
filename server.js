var net = require('net'),
    redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    inquirer = require('inquirer'),
    sockets = {},
    store = {},
    gameId = 0,
    checkPing = [];

    store.sockets = [];

var server = net.createServer(function(socket) {
    console.log('connect');
    var id = Math.floor(Math.random()*1e5);

    socket.gameId = gameId;
    socket.id = id;
    sockets[id] = socket;

    if(store.sockets.length < 3) {
        store.sockets.push(id);
    }
    console.log('begin sockets ' + store.sockets.length + ' ' + store.sockets);

    if(store.sockets.length == 2) {
        store.gameId = gameId;

        setTimeout(function() {
            start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                checkPing = [];
                gameId++;
            });
        }, 10000);
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
    socket.on('end', function() {

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

        for(var t = 0; t < data.sockets.length; t++) {
            store.sockets.push(data.sockets[t]);
            sockets[data.sockets[t]].gameId = gameId;
        }
        console.log(' restart sockets ' + store.sockets.length + ' ' + store.sockets);

        if(store.sockets.length > 1) {
            store.gameId++;
            start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                checkPing = [];
                gameId++;
                console.log('restart sockets ' + store.sockets.length + ' ' + store.sockets);
            });
        }
    } else if (channel == 'delete') {

        if(store.sockets.indexOf(data.socket) != -1) {
            var index = store.sockets.indexOf(data.socket);
            store.sockets.splice(index, 1);
        }
        if(data.sockets){
            store.sockets = data.sockets;
        }

        console.log('delete sockets ' + store.sockets.length + ' ' + store.sockets);

        if(store.sockets.length > 1) {
            store.gameId = gameId;
            start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                checkPing = [];
                gameId++;
            });
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
            start(function(err, res) {
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

function start(next) {
    console.log('start');

    for(var i = 0; i < store.sockets.length; i++) {
        var index = store.sockets[i];
        console.log(index);
        sockets[index].write(JSON.stringify('ping'));
    }

    setTimeout(function(){
        console.log(checkPing.length  + '   ' + store.sockets.length);
        if(checkPing.length == store.sockets.length) {
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
    }, 5000);
}