var net = require('net'),
    redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    sockets = {},
    store = {},
    gameId = 0,
    pingsList = [],
    figures = [];

    store.sockets = [];
    store.socketsName = {};

//var maxNumPlayers = 3;
//
//
//function Player(name, socket) {
//    this.name = name;
//    this.socket = socket;
//    this.is_ready = false;
//    this.room = null;
//    this.figure = null;
//}
//
//function Room(name, maxPlayers) {
//    this.name = name;
//    this.maxPlayers = maxPlayers;
//    this.numPlayers = 0;
//    this.players = [];
//    this.state = 'waiting';
//}
//
//var playersList = [];
//var roomsList = [];
//
//
//Player.prototype.Reade = function() {
//    this.is_ready = true;
//};
//
//Room.prototype.wait = function() {
//    this.state = 'waiting';
//};
//Room.prototype.wait = function() {
//    this.state = 'playing';
//};
//Room.prototype.wait = function() {
//    this.state = 'finish';
//};
//Room.prototype.broadcastAll = function(message) {
//
//    for(var i = 0; i < this.players.length; i++) {
//        this.players[i].socket.write(message);
//    }
//};
//
//Room.prototype.broadcast = function(message, except) {
//
//    for(var i = 0; i < this.players.length; i++) {
//        if(this.players[i].name != except.name) {
//            this.players[i].socket.write(message);
//        }
//    }
//};
//
//function chooseRoom(player) {
//    var flag = false;
//    for(var i = 0; i < roomsList.length; i++) {
//        player:
//        for(var j = 0; j < roomsList[i].players.length; j++) {
//            if(roomsList[i].players[j].figure == player.figure && roomsList[i].numPlayers < roomsList[i].maxPlayers) {
//                flag = true;
//                continue player;
//            }
//        }
//        if(flag) {
//            roomsList[i].players.push(player);
//        }
//    }
//}

net.createServer(function(socket) {
    console.log('connect');
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
            controller.start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                pingsList = [];
                gameId++;
            });
        }, 10000);
    }

    socket.on('data', function(data){

        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log( JSON.parse(data.toString()) );
        }

        if(typeof JSON.parse(data.toString()) === 'object') {

            var action = JSON.parse(data.toString()).action,
                options = JSON.parse(data.toString()).data;

            console.log('action ' + action);

            if(typeof controller[action] === 'function') {
                controller[action](options);
            }
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
            controller.start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                pingsList = [];
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
            controller.start(function(err, res) {
                if(err) throw err;

                store.sockets = [];
                pingsList = [];
                gameId++;
            });
        }
    } else {
        socket = data.sockets[data.current];

        if(channel == "finish") {

            for(var i = 0; i < data.sockets.length; i++) {
                sockets[data.sockets[i]].write(JSON.stringify(data.message));

                if(store.sockets.indexOf(data.sockets[i]) == -1) {
                    store.sockets.push(data.sockets[i]);
                }
            }
            setTimeout(function() {
                controller.start(function(err, res) {
                    if(err) throw err;

                    store.sockets = [];
                    pingsList = [];
                    gameId++;
                });
                return;
            }, 1000)

        }

        if(channel == "game") {
            redis.lpush('tasks', JSON.stringify(data));
        }

        if(sockets[socket]) {
            console.log(data);
            var obj = {
                action: 'move',
                data: data
            };

            console.log(obj);
            sockets[socket].write(JSON.stringify(obj));
        }
    }

});

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
    },
    'start': function(next) {

        for(var i = 0; i < store.sockets.length; i++) {
            var index = store.sockets[i],
                obj = {
                    action: 'ping'
                };
            sockets[index].write(JSON.stringify(obj));
            console.log(sockets[index].figure);
            store.socketsName[i+''] = sockets[index].figure;
        }
        store.figures = figures;

        setTimeout(function(){
            console.log(pingsList.length  + '   ' + store.sockets.length);
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
};