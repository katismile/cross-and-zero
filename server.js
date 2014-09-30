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
                        var winnerMessage = [games[id].field, 'The winner is ' + games[id].socketsName[games[id].current]];
                        messager(games[id].sockets, JSON.stringify(winnerMessage));
                    }
                    else if ( !checkWinner(games[id].field) && games[id].combinations.length == 0) {
                        var lostMessage = [games[id].field, 'The game is finished, both of you lost'];
                        messager(games[id].sockets, JSON.stringify(lostMessage));
                    }
                    else {
                        games[id].current = games[id].current == 1 ? 0 : 1;
                        var secondMessage = [games[id].id, games[id].combinations, games[id].field];
                        games[id].sockets[games[id].current].write(JSON.stringify(secondMessage));

                    }
                }
            }
        }
    });

    socket.on('end', function() {
        if (sockets.indexOf(socket) != -1) {
            var index = sockets.indexOf(socket);
            sockets.splice(index, 1);
        }
        var gameId = socket.gameId;
        if (games[gameId]) {
            var sock = socket == games[gameId].sockets[0] ? games[gameId].sockets[1] : games[gameId].sockets[0];
            sock.write('You opponent has left, please wait for another player');
            games[gameId] = null;
            sock.gameId = i;
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
    var message = [games[i].id, games[i].combinations];
    //messager(games[i].sockets, 'New game is stated');
    games[i].sockets[games[i].current].write(JSON.stringify(message));
    i++;
}
function messager(sockets, message) {
    for(var j = 0; j < sockets.length; j++){
        sockets[j].write(message);
        sockets[j].destroy();
    }
}

