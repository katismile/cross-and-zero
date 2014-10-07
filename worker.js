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
        taskHandler[parsed.type](parsed.data);
    }
});
worker();

var taskHandler = {
    'start game': function(data) {
        console.log(data);
        var sockets = data.sockets;
        var gameId = data.i;
        start(games, gameId, sockets);
    },
    'set position': function(data) {
        var id = data.id;
        if(games[id] && games[id].combinations.length >= 0 && games[id].sockets.length > 1) {
            var combination = data.combination;
            var combinations = data.combinations;
            games[id].combinations = combinations;
            setPosition(games[id].socketsName[games[id].current], games[id].field, combination);
            if (checkWinner(games[id].field)) {
                console.log('win');
                var winnerMessage = {
                    setting: 'finish message',
                    field: games[id].field,
                    message: 'The winner is ' + games[id].socketsName[games[id].current] + ', game: ' + id
                };
                for (var i = 0; i < games[id].sockets.length; i++){
                    redis.publish(channel, JSON.stringify([games[id].sockets[i], winnerMessage]));
                }
            }
            else if (!checkWinner(games[id].field) && games[id].combinations.length == 0) {
                console.log('lost');
                var lostMessage = {
                    setting: 'finish message',
                    field: games[id].field,
                    message: 'The game is finished, all of you lost'
                };
                for (var j = 0; j < games[id].sockets.length; j++){
                    redis.publish(channel, JSON.stringify([games[id].sockets[j], lostMessage]));
                }
            }
            else {
                games[id].current = games[id].current < games[id].sockets.length - 1 ? games[id].current + 1 : 0;
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
    'disconnect': function(data) {
        console.log('disconnect');
        var gameId = data.gameId;
        var socketId = data.socketId;
        if(games[gameId]){
            var stayedPlayers = [];
            for (var i = 0; i < games[gameId].sockets.length; i++) {
                if (socketId !== games[gameId].sockets[i]) {
                    stayedPlayers.push(games[gameId].sockets[i]);
                }
            }
            var message = {
                socketId: stayedPlayers
            };
            var messageForClient = {
                setting: 'opponent exit',
                message: 'You opponent has left, please wait for another player'
            };
            games[gameId] = null;
            redis.publish(stayed, JSON.stringify(message));

            for (var j = 0; j < stayedPlayers.length; j++) {
                redis.publish(channel, JSON.stringify([stayedPlayers[j],messageForClient]));
            }
        }
    }
};

function start(games, i, sockets) {
    var combinations = [];
    var field = [];
    var counter = sockets.length === 2 ? 3 : 5;
    for(var j = 0; j < counter; j++){
        field.push([]);
        for(var k = 0; k < counter; k++){
            combinations.push([j, k]);
            field[j].push(' ');
        }
    }
    var socketsName = {
        0: 'x',
        1: '0',
        2: 'y'
    };
    console.log("start");
    games[i] = new Game(i, combinations, field, socketsName, sockets);
    var message = {
        setting: 'choose position',
        id: games[i].id,
        combinations: games[i].combinations,
        field: games[i].field
    };
    redis.publish(channel, JSON.stringify([games[i].sockets[0],message]));
}
function setPosition(current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];

    field[position1][position2] = current;
}