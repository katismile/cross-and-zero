var net = require('net');
var Table = require('cli-table');
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
<<<<<<< HEAD
        if(message.indexOf('[') !== -1){
            var id = JSON.parse(message)[0];
            if(games[id] && games[id].combinations.length >=0  && games[id].sockets.length == 2){
                var combination = JSON.parse(message)[1];
                games[id].combinations = JSON.parse(message)[2];
                if(combination.length == 2){
                    setPosition(games[id].current, games[id].field, combination);
                    var table = new Table({
                        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
                            , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
                            , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
                            , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
                    });
                    table.push(games[id].field[0], games[id].field[1], games[id].field[2]);
                    console.log(table.toString());
                    if(checkWinner(games[id].field)){
                        messager(games[id].sockets, 'The winner is ' + games[id].socketsName[games[id].current]);
                    }
                    else if( !checkWinner(games[id].field) && games[id].combinations.length == 0){
                        messager(games[id].sockets, 'The game is finished, both of you lost');
                    }
                    else{
                        var secondMessage = [games[id].id, games[id].combinations];
                        games[id].sockets[games[id].current].write(JSON.stringify(secondMessage));
                        games[id].current = games[id].current == 1 ? 0 : 1;
=======
        if(message.indexOf('[') !== -1) {
            var id = JSON.parse(message)[0];
            if(games[id] && games[id].combinations.length >=0  && games[id].sockets.length == 2) {
                var combination = JSON.parse(message)[1];
                games[id].combinations = JSON.parse(message)[2];
                if(combination.length == 2) {
                    setPosition(games[id].current, games[id].field, combination);
                    console.log(games[id].field);
                    if(checkWinner(games[id].field)) {
                        messager(games[id].sockets, 'The winner is ' + games[id].socketsName[games[id].current]);
                    }
                    else if( !checkWinner(games[id].field) && games[id].combinations.length == 0) {
                        messager(games[id].sockets, 'The game is finished, you both lost');
                    }
                    else {
                        var secondMessage = [games[id].id, games[id].combinations];
                        games[id].sockets[games[id].current].write(JSON.stringify(secondMessage));
                        games[id].current = games[id].current ? 0 : 1;
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
                    }
                }
            }
        }
    });

<<<<<<< HEAD
    socket.on('end', function(){
=======
    socket.on('end', function() {
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
        var gameId = socket.gameId;
        var sock = socket == games[gameId].sockets[0] ? games[gameId].sockets[1] : games[gameId].sockets[0];
        games[gameId] = null;
        sock.gameId = i;
        sockets.push(sock);
        if(sockets.length == 2){
            start();
        }
    })

}).listen(7777, function() {
    console.log('Server is running!');
});

function setPosition(current, field, comb) {
    var position1 = comb[0],
        position2 = comb[1];
<<<<<<< HEAD
    field[position1][position2] = current == 1 ? 'x' : 0;
}
function start(){
    var socketsName = {
        1 : 'Cross',
        0 : 'Zeroes'
=======
    field[position1][position2] = current;
}
function start() {
    var socketsName = {
        0 : 'Cross',
        1: 'Zeroes'
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
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
<<<<<<< HEAD
    var field = [[' ', ' ', ' '],[' ', ' ', ' '],[' ', ' ', ' ']];
=======
    var field = [[],[],[]];
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
    var couple = sockets;
    sockets = [];
    games[i] = new Game(i, combinations, field, socketsName, couple);
    var message = [games[i].id, games[i].combinations];
    games[i].sockets[games[i].current].write(JSON.stringify(message));
<<<<<<< HEAD
    games[i].current = games[i].current == 1 ? 0 : 1;
    i++;
}
function messager(sockets, message){
    for(var j = 0; j < sockets.length; j++){
        sockets[j].write(message);
        sockets[j].destroy();
    }
}
=======
    games[i].current = games[i].current ? 0 : 1;
    i++;
}
function messager(sockets, message) {
    for(var j = 0; j < sockets.length; j++) {
        sockets[j].write(message);
        sockets[j].destroy();
    }
}
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
