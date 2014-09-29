var net = require('net');
var checkWinner = require('./check_winner');
var sockets = [];
var games = [];
var i = 0;

var Game = function(id, combinations, field, socketsName, sockets){
    this.id = id;
    this.combinations = combinations;
    this.field = field;
    this.current = 0;
    this.socketsName = socketsName;
    this.sockets = sockets;
};
function start(){
    var socketsName = {
        0 : 'Cross',
        1: 'Zeroes'
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
    var field = [[],[],[]];
    var couple = sockets;
    sockets = [];
    games[i] = new Game(i, combinations, field, socketsName, couple);
    var message = [games[i].id, games[i].combinations];
    games[i].sockets[games[i].current].write(JSON.stringify(message));
    games[i].current = games[i].current ? 0 : 1;
    i++;
}
var server = net.createServer(function(socket) {
    console.log('connect');
    if (sockets.length < 2) {
        socket.gameId = i;
        sockets.push(socket);
    }
    if (sockets.length == 2) {
        start(games, i);
    }
    socket.on('data', function(data){
        var message = data.toString();
        if(message.indexOf('[') !== -1){
            var pasreMessage = JSON.parse(message);
            var id = pasreMessage[0];

            if(games[id] && games[id].combinations.length >=0  && games[id].sockets.length == 2){
                var combination = pasreMessage[1];
                games[id].combinations = pasreMessage[2];
                if(combination.length == 2){
                    setPosition(games[id].current, games[id].field, combination);
                    console.log(games[id].field);
                    if(checkWinner(games[id].field)){
                        for(var k = 0; k < games[id].sockets.length; k++){
                            console.log('The winner is ' + games[id].socketsName[games[id].current]);
                            games[id].sockets[k].write('The winner is ' + games[id].socketsName[games[id].current]);
                            games[id].sockets[k].destroy();
                        }
                    }
                    else if( !checkWinner(games[id].field) && games[id].combinations.length == 0){
                        for(var j = 0; j < games[id].sockets.length; j++){
                            console.log('The game is finished, you both lost');
                            games[id].sockets[j].write('The game is finished, you both lost');
                            games[id].sockets[j].destroy();
                        }
                    }
                    else{
                        var secondMessage = [games[id].id, games[id].combinations];
                        games[id].sockets[games[id].current].write(JSON.stringify(secondMessage));
                        games[id].current = games[id].current ? 0 : 1;
                    }
                }
            }
        }
    });

    socket.on('end', function(){
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
    field[position1][position2] = current;
}