var redis = require('redis').createClient();
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var Game = require('./Game');
var checkWinner = require('./check_winner');
var games = [];
var channel  = 'sockets commands';
var stayed = 'to stayed user';
var worker = async(function() {
    while(true) {
        var task = await(redis.brpop.bind(redis, 'tasks', 1000));
        var parsed = JSON.parse(task[1]);
        taskHandler[parsed[0]](parsed[1]);
    }
});
worker();

var taskHandler = {
    'start game': function(args) {
        var sockets = args[0];
        var gameId = args[1];
        start(games, gameId, sockets);
    },
    'set position': function(args) {
        var id = args[0];
        if(games[id] && games[id].combinations.length >= 0 && games[id].sockets.length === 2) {
            var combination = args[1];
            var combinations = args[2];
            games[id].combinations = combinations;
            setPosition(games[id].current, games[id].field, combination);
            if (checkWinner(games[id].field)) {
                var winnerMessage = {
                    setting: 'finish message',
                    field: games[id].field,
                    message: 'The winner is ' + games[id].socketsName[games[id].current] + ', game: ' + id
                };
                redis.publish(channel, JSON.stringify([games[id].sockets[0], winnerMessage]));
                redis.publish(channel, JSON.stringify([games[id].sockets[1], winnerMessage]));
            }
            else if (!checkWinner(games[id].field) && games[id].combinations.length == 0) {
                var lostMessage = {
                    setting: 'finish message',
                    field: games[id].field,
                    message: 'The game is finished, both of you lost'
                };
                redis.publish(channel, JSON.stringify([games[id].sockets[0], lostMessage]));
                redis.publish(channel, JSON.stringify([games[id].sockets[1], lostMessage]));
            }
            else {
                games[id].current = games[id].current == 1 ? 0 : 1;
                var message = {
                    setting: 'choose position',
                    id: games[id].id,
                    combinations: games[id].combinations,
                    field: games[id].field
                };
                redis.publish(channel, JSON.stringify([games[id].sockets[games[id].current], message]));
            }
        }
    },
    'disconnect': function(args) {
        var gameId = args[0];
        var socketId = args[1];
        if(games[gameId]){
            var stayedPlayer = socketId === games[gameId].sockets[0] ? games[gameId].sockets[1] : games[gameId].sockets[0];
            var message = {
                socketId: stayedPlayer
            };
            var messageForClient = {
                setting: 'opponent exit',
                message: 'You opponent has left, please wait for another player'
            };
            games[gameId] = null;

            redis.publish(stayed, JSON.stringify(message));
            redis.publish(channel, JSON.stringify([stayedPlayer,messageForClient]));
        }
    }
};

function start(games, i, sockets) {
    var socketsName = {
        0: 'Cross',
        1: 'Zero'
    };
    var combinations = [
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 0],
        [2, 1],
        [2, 2]
    ];
    var field = [[' ', ' ', ' '],[' ', ' ', ' '],[' ', ' ', ' ']];

    games[i] = new Game(i, combinations, field, socketsName, sockets);
    var message = {
        setting: 'choose position',
        id: games[i].id,
        combinations: games[i].combinations,
        field: games[i].field
    };
    redis.publish(channel, JSON.stringify([games[i].sockets[games[i].current],message]));
}
function setPosition(current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];

    field[position1][position2] = current == 1 ? 0 : 'x';
}