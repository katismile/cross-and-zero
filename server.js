var net = require('net');
var sockets = [];
var socketsName = {
    0 : 'Cross',
    1: 'Zeroes'
};
var current = 0;
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

var server = net.createServer(function(socket) {
    console.log('connect');
    if(sockets.length < 2){
        sockets.push(socket);
    }
    else{
        socket.destroy();
    }
    if(sockets.length == 2){
        sockets[0].write('move, ' + JSON.stringify(combinations))

    }
    socket.on('data', function (data) {
        var dataToString = data.toString();
        if(dataToString.indexOf('[') !== -1){
            if(combinations.length >= 0){
                var currentData = JSON.parse(data.toString());
                var position = currentData[0];
                combinations = currentData[1];
                if (position.length == 2) {
                    setPosition(current, field, position);
                    console.log('field');
                    console.log(field);
                    if(checkWinner(field)){
                        for(var i = 0; i < sockets.length; i++){
                            console.log('The winner is ' + socketsName[current]);
                            sockets[i].write('The winner is ' + socketsName[current]);
                            sockets[i].destroy();
                        }
                    }
                    else if(!checkWinner(field) && combinations.length == 0){
                        for(var j = 0; j < sockets.length; j++){
                            console.log('The game is finished, you both lost');
                            sockets[j].write('The game is finished, you both lost');
                            sockets[j].destroy();
                        }
                    }
                    else{
                        current = current ? 0 : 1;
                        sockets[current].write('move, ' + JSON.stringify(combinations))
                    }
                }
            }
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

function checkWinner(field){
    if(field[0][0] !== undefined && field[1][0] !== undefined && field[2][0] !== undefined && field[0][0] == field[1][0] && field[1][0] == field[2][0]){
        return true;
    }
    if(field[0][1] !== undefined && field[1][1] !== undefined && field[2][1] !== undefined && field[0][1] == field[1][1] && field[1][1] == field[2][1]){
        return true;
    }
    if(field[0][2] !== undefined && field[1][2] !== undefined && field[2][2] !== undefined && field[0][2] == field[1][2] && field[1][2] == field[2][2]){
        return true;
    }
    if(field[0][0] !== undefined && field[1][1] !== undefined && field[2][2] !== undefined && field[0][0] == field[1][1] && field[1][1] == field[2][2]){
        return true;
    }
    if(field[0][2] !== undefined && field[1][1] !== undefined && field[2][0] !== undefined && field[0][2] == field[1][1] && field[1][1] == field[2][0]){
        return true;
    }
    else{
        for(var i = 0; i < field.length; i ++){
            for (var j = 0; j < field[i].length; j++){
                if(field[i][j] === field[i][j + 1] && field[i][j + 1] == field[i][j + 2]){
                    return true;
                }
            }
        }
    }
    return false;
}
