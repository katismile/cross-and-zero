var checkWinner = require('./check_winner');
var redis = require('redis').createClient();
var channel  = 'sockets commands';
var stayed = 'to stayed user';
var start = require('./start.js');
var games = [];

var taskHandler = {
    'start game': function (data) {
        var sockets = data.sockets;
        var gameId = data.i;
        start(games, gameId, sockets, channel);
    },
    'make move': function (data) {
        var id = data.id;
        var validGame = (games[id] && games[id].combinations.length >= 0 && Object.keys(games[id].sockets).length > 1);
        if (validGame) {
            games[id].combinations = data.combinations;
            setPosition(games[id].current, games[id].field, data.combination);
            var isWinner = (checkWinner(games[id].field));
            var allLost = (!checkWinner(games[id].field) && games[id].combinations.length == 0);
            if (isWinner) {
                onWinner(games[id], id, channel);
                return;
            }
            if (allLost) {
                onLost(games[id], channel);
                return;
            }
            onNext(games[id], channel)
        }
    },
    'disconnect': function (data) {
        var gameId = data.gameId;
        var socketId = data.socketId;
        if (games[gameId]) {
            var stayedPlayers = [];
            for (var i = 0; i < Object.keys(games[gameId].sockets).length; i++) {
                var isStayed = (socketId !== games[gameId].sockets[Object.keys(games[gameId].sockets)[i]]);
                if (isStayed) {
                    stayedPlayers.push(games[gameId].sockets[Object.keys(games[gameId].sockets)[i]]);
                }
            }
            var message = {
                socketId: stayedPlayers
            };
            var messageForClient = {
                type: 'opponent exit',
                message: 'You opponent has left, please wait for another player'
            };
            games[gameId] = null;
            redis.publish(stayed, JSON.stringify(message));

            for (var j = 0; j < stayedPlayers.length; j++) {
                redis.publish(channel, JSON.stringify([stayedPlayers[j], messageForClient]));
            }
        }
    }
};

function setPosition (current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];
    field[position1][position2] = current;
}
function getNext (game) {
    if (game.current === 'x') {
        return (game.sockets['0'] !== undefined)
            ? '0'
            : 'y';
    }
    else if (game.current === '0') {
        return (game.sockets['y'] !== undefined)
            ? 'y'
            : 'x';
    }
    else {
        return (game.sockets ['x'] !== undefined)
            ? 'x'
            : '0';
    }
}
function onWinner (game, id, channel) {
    var winnerMessage = {
        type: 'finish message',
        field: game.field,
        message: 'The winner is ' + game.current + ', game: ' + id
    };
    for (var i = 0; i < Object.keys(game.sockets).length; i++) {
        redis.publish(channel, JSON.stringify([game.sockets[Object.keys(game.sockets)[i]], winnerMessage]));
    }
}
function onLost (game, channel) {
    var lostMessage = {
        type: 'finish message',
        field: game.field,
        message: 'The game is finished, all of you lost'
    };
    for (var j = 0; j < Object.keys(game.sockets).length; j++) {
        redis.publish(channel, JSON.stringify([game.sockets[Object.keys(game.sockets)[j]], lostMessage]));
    }
}
function onNext (game, channel) {
    game.current = getNext(game);
    var message = {
        type: 'choose position',
        id: game.id,
        combinations: game.combinations,
        field: game.field
    };
    redis.publish(channel, JSON.stringify([game.sockets[game.current], message]));
}

module.exports = taskHandler;
