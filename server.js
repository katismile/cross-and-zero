var net = require('net');
var checkWinner = require('./check_winner');
var Game = require('./Game');
var sockets = [];
var games = [];
var i = 0;

var server = net.createServer(function(socket) {
    console.log('connect');
    if (sockets.length < 2) {
        socket.gameId = i;
        sockets.push(socket);
    }
    if (sockets.length == 2) {
        start(games, i);
    }
    socket.on('data', function(data) {
        var message = data.toString();
        if (message.indexOf('[') !== -1) {
            var id = JSON.parse(message)[0];
            if (games[id] && games[id].combinations.length >=0  && games[id].sockets.length === 2) {
                var combination = JSON.parse(message)[1];
                games[id].combinations = JSON.parse(message)[2];
                if (combination.length == 2) {
                    setPosition(games[id].current, games[id].field, combination);
                    if (checkWinner(games[id].field)) {
                        var winnerMessage = {
                            setting: 'finish message',
                            field: games[id].field,
                            message: 'The winner is ' + games[id].socketsName[games[id].current]
                        };
                        messager(games[id].sockets, JSON.stringify(winnerMessage));
                    }
                    else if ( !checkWinner(games[id].field) && games[id].combinations.length == 0) {
                        var lostMessage = {
                            setting: 'finish message',
                            field: games[id].field,
                            message: 'The game is finished, both of you lost'
                        };
                        messager(games[id].sockets, JSON.stringify(lostMessage));
                    }
                    else {
                        games[id].current = games[id].current == 1 ? 0 : 1;
                        var secondMessage = {
                            setting: 'choose position',
                            id: games[id].id,
                            combinations: games[id].combinations,
                            field: games[id].field
                        };
                        games[id].sockets[games[id].current].write(JSON.stringify(secondMessage));

                    }
                }
            }
        }
    });

    socket.on('end', function() {
        console.log('gameId on end: ' + socket.gameId);
        if (sockets.indexOf(socket) != -1) {
            console.log('in sockets');
            var index = sockets.indexOf(socket);
            sockets.splice(index, 1);
            console.log(sockets);
        }

        var gameId = socket.gameId;
        console.log(!!games[gameId]);
        if (games[gameId]) {
            var sock = socket == games[gameId].sockets[0] ? games[gameId].sockets[1] : games[gameId].sockets[0];
            var message = {
                setting: 'opponent exit',
                message: 'You opponent has left, please wait for another player'
            };
//            console.log('i' + i);
            sock.gameId = i;
            sock.write(JSON.stringify(message));
            games[gameId] = null;
            sockets.push(sock);
            if(sockets.length == 2) {
                start();
            }
        }
    })
}).listen(7777, function() {
    console.log('Server is running!');
});

function setPosition(current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];

    field[position1][position2] = current == 1 ? 0 : 'x';
}
function start() {
    console.log('start');
    var socketsName = {
        0 : 'Cross',
        1 : 'Zero'
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
    var couple = sockets;
    sockets = [];

    games[i] = new Game(i, combinations, field, socketsName, couple);
    console.log('gameId on start: ' + games[i].id);
    var message = {
        setting: 'choose position',
        id: games[i].id,
        combinations: games[i].combinations,
        field: games[i].field
    };
    games[i].sockets[games[i].current].write(JSON.stringify(message));
    ++i;
}
function messager(sockets, message) {
    for(var j = 0; j < sockets.length; j++){
        sockets[j].write(message);
        sockets[j].destroy();
    }
}

