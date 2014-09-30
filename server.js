var net = require('net'),
    tik_tak_toe = require('./tik_tak_toe'),
    i = 0;

var server = net.createServer(function(socket) {
    console.log('connect');
    if ( tik_tak_toe.sockets.length < 2) {
        socket.gameId = i;
        tik_tak_toe.sockets.push(socket);
    }
    if (tik_tak_toe.sockets.length == 2) {
        tik_tak_toe.start(i);
        i++;
    }

    socket.on('data', function(data){
        var message = data.toString();

        if(message.indexOf('[') !== -1){
            tik_tak_toe.move(message);
        }
    });
    socket.on('end', function() {
        gameId =  socket.gameId;
        console.log('the end! game id ' +  gameId);

        if(tik_tak_toe.games[gameId]) {
            var newSocket = socket ==  tik_tak_toe.games[gameId].sockets[0] ?  tik_tak_toe.games[gameId].sockets[1] :  tik_tak_toe.games[gameId].sockets[0];
            newSocket.gameId = i;
            newSocket.write('Game is over. Your opponent is disconnected. Please, wait another opponent.');
            tik_tak_toe.games[gameId] = null;
            tik_tak_toe.sockets.push(newSocket);

            if( tik_tak_toe.sockets.length == 2) {
                tik_tak_toe.start(i);
                i++;
            }
        }
    });

}).listen(7777, function() {
    console.log('Server is running!');
});