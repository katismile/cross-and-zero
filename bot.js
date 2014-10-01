var net = require('net'),
    argv = require('optimist').argv,
    commands = require('./commands');


if(argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
} else {
    createSocket();
}

function createSocket() {
    var client = new net.Socket( {
        allowHalfOpen: true,
        readable: true,
        writable: true
    });

    client.connect(7777, function() {
        client.write(JSON.stringify('Hello Server!'));
    });

    client.on('data', function(data) {
        if(typeof JSON.parse(data.toString()) === 'object') {
            obj = JSON.parse(data.toString());
            obj.client = client;

            move(obj);
        }
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
        }
    });
}

function move(message) {

    var gameId = message.gameId,
        combinations = message.combinations,
        field = message.field,
        current  = message.current;


    commands.setField(field);

    var length = combinations.length,
        value = Math.floor(Math.random()*length),
        combination = combinations.splice(value, 1)[0];
    field[combination[0]][combination[1]] = current;

    commands.setField(field);

    var newMessage = {
        type: "move",
        gameId: gameId,
        combination: combination,
        combinations: combinations,
        field: field,
        current: current
    };
    message.client.write(JSON.stringify(newMessage));
}