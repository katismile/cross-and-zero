var net = require('net'),
    redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    sockets = {},
    store = {},
    gameId = 0,
    pingsList = [],
    figures = [],
    flag = true;

store.sockets = [];
store.socketsName = {};
var checkInterval;

net.createServer(function(socket) {
    console.log('connect');
    socket.setEncoding("utf8");

    var id = Math.floor(Math.random()*1e5);

    socket.gameId = gameId;
    socket.id = id;
    sockets[id] = socket;


    if(store.sockets.length < 3) {
        store.sockets.push(id);

        var obj = {
            action: "choose figure"
        };
        socket.write(JSON.stringify(obj));
    }

    if(store.sockets.length == 2) {
        store.gameId = gameId;

        setTimeout(function() {
            start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                pingsList = [];
                gameId++;
            });
        }, 10000);
    }

    socket.on('data', function(data){

        try {
            data = JSON.parse(data);

            if(typeof data === 'string') {
                console.log(data);
            }

            if(typeof data === 'object') {

                var action = data.action,
                    options = data.data;

                console.log('action ' + action);
                if(action === 'check'){
                    console.log('clear interval');
                    clearTimeout(checkInterval);
                }

                if(typeof controller[action] === 'function') {
                    controller[action](options);
                }
            }
        } catch(e) {
            console.log(e);
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
    if(data.sockets) {
        var socket = data.sockets[data.current];
        channelController[channel](data);
    }
    if(flag) {
        if(sockets[socket]) {
            var obj = {
                action: 'move',
                data: data
            };
            console.log('next move');
            checkInterval = setTimeout(function(){
                console.log('remove socket');
                sockets[socket].end();
                var obj = {
                    action: "disconnect",
                    data: {
                        gameId: sockets[socket].gameId,
                        socketId: sockets[socket].id
                    }
                };
                redis.lpush('tasks', JSON.stringify(obj), function(err, res) {
                    if(err) throw err;
                });
            }, 5000);
            if(sockets[socket]) {
                sockets[socket].write(JSON.stringify(obj));
            }
        }
    }
});

var channelController = {
    'restart': function(data) {
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
                pingsList = [];
                gameId++;
                console.log('restart sockets ' + store.sockets.length + ' ' + store.sockets);
            });
        }
    },
    'delete': function(data) {
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
                pingsList = [];
                gameId++;
            });
        }
    },
    "finish": function(data) {
        for(var i = 0; i < data.sockets.length; i++) {
            sockets[data.sockets[i]].write(JSON.stringify(data.message));

            if(store.sockets.indexOf(data.sockets[i]) == -1) {
                store.sockets.push(data.sockets[i]);
            }
        }
        flag = false;

        setTimeout(function() {
            start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                pingsList = [];
                gameId++;
            });
        }, 1000);
    },
    "game": function(data) {
        redis.lpush('tasks', JSON.stringify(data), function(err, res) {
            if(err) throw err;
        });
    }
};

var controller = {
    'ping': function(options) {
        pingsList.push(options.ping);
    },
    'save figure': function(options) {
        figures.push(options.figure);
    },
    'check': function(options) {

        var obj = {
            action: 'check',
            data: options

        };
        redis.lpush('tasks', JSON.stringify(obj));
    }
};
function start(next) {
    flag = true;

    for(var i = 0; i < store.sockets.length; i++) {
        var index = store.sockets[i],
            obj = {
                action: 'ping'
            };
        sockets[index].write(JSON.stringify(obj));
        store.socketsName[i+''] = sockets[index].figure;
    }
    store.figures = figures;

    setTimeout(function(){
        if(pingsList.length == store.sockets.length) {
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