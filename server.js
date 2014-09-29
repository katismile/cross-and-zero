var net = require('net'),
    TikTakToe = require('./TikTakToe'),
    i = 0;

var server = net.createServer(function(socket) {
    console.log('connect');
    if ( TikTakToe.sockets.length < 2) {
        socket.gameId = i;
        TikTakToe.sockets.push(socket);
    }
    if (TikTakToe.sockets.length == 2) {
        TikTakToe.start(i);
        i++;
    }

    socket.on('data', function(data){
        var message = data.toString();

        if(message.indexOf('[') !== -1){
            TikTakToe.move(message);
        }
    });
    socket.on('end', function() {
        gameId =  socket.gameId;
        console.log('the end! game id ' +  gameId);

        var newSocket = socket ==  TikTakToe.games[gameId].sockets[0] ?  TikTakToe.games[gameId].sockets[1] :  TikTakToe.games[gameId].sockets[0];
        newSocket.gameId = i;
        newSocket.write('Game is over. Your opponent is disconnect. Please, wait another opponent.');
        TikTakToe.sockets.push(newSocket);
        TikTakToe.games[gameId] = null;

        if( TikTakToe.sockets.length == 2) {
            TikTakToe.start(i);
            i++;
        }
    });

}).listen(7777, function() {
    console.log('Server is running!');
});