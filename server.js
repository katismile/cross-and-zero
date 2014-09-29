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

            var parseMessage = JSON.parse(message);
            var id = parseMessage[0];

            if( TikTakToe.games[id] &&  TikTakToe.games[id].combinations.length >=0){
                var combination = parseMessage[1];
                TikTakToe.games[id].combinations = parseMessage[2];
                if(combination.length == 2){
                    TikTakToe.setPosition( TikTakToe.games[id].current,  TikTakToe.games[id].field, combination);
                    console.log( TikTakToe.games[id].field);
                    if(TikTakToe.checkWinner( TikTakToe.games[id].field)){
                        for(var k = 0; k <  TikTakToe.games[id].sockets.length; k++){
                            console.log('The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current]);
                            TikTakToe.games[id].sockets[k].write('The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current]);
                        }
                    }
                    else if( !TikTakToe.checkWinner( TikTakToe.games[id].field) &&  TikTakToe.games[id].combinations.length == 0){
                        for(var j = 0; j <  TikTakToe.games[id].sockets.length; j++){
                            console.log('The game is finished, you both lost');
                            TikTakToe.games[id].sockets[j].write('The game is finished, you both lost');
                        }
                    }
                    else{
                        TikTakToe.games[id].current =  TikTakToe.games[id].current ? 0 : 1;
                        var secondMessage = [ TikTakToe.games[id].id,  TikTakToe.games[id].combinations];
                        console.log('Current ' +  TikTakToe.games[id].current);
                        TikTakToe.games[id].sockets[ TikTakToe.games[id].current].write(JSON.stringify(secondMessage));
                    }
                }
            }
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