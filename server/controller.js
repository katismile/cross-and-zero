var redis = require('redis').createClient();
var onStart = require('./on_start');
var newGame = require('./new_game');

var requestHandler = {
    'ping': function (opt) {
        console.log('ping');
        opt.scope.pings.push(opt.socket)
    },
    'new game': function (opt) {
        newGame(opt.socket, opt.scope)
    },
    'make move': function (opt) {
        redis.lpush('tasks', JSON.stringify(opt.message));
    },
    'choose suit': function (opt) {
        opt.scope.suits = opt.message.data.suits;
        opt.scope.flag = true;
        opt.socket.suit = opt.message.data.suit;
        opt.socket.gameId = opt.scope.i;
        opt.socket.socketId = opt.scope.socketId;
        opt.scope.socketsPool[opt.scope.socketId] = opt.socket;
        console.log(opt.message);

        opt.scope.sockets[opt.message.data.suit] = opt.scope.socketId;

        opt.scope.socketId++;
        if (Object.keys(opt.scope.sockets).length == opt.scope.socketsLength) {
            setTimeout(function(){
                onStart(opt.scope, redis);
            }, 10000);
        }
    },
    'disconnect': function(opt){
        //if (opt.scope.sockets[opt.socket.suit] != -1) delete opt.scope.sockets[opt.socket.suit];
        //delete opt.scope.socketsPool[opt.socket.socketId];
        var gameId = opt.socket.gameId;
        var socketId = opt.socket.socketId;
        var message = {
            type : 'disconnect',
            data : {
                gameId : gameId,
                socketId : socketId
            }
        };
        redis.lpush('tasks', JSON.stringify(message));
    }
};
module.exports = requestHandler;