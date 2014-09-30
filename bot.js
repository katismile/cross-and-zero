var net = require('net'),
    argv = require('optimist').argv,
    setField = require('./set_field');


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
        client.write('Hello Server!');
    });

    client.on('data', function(data) {
        if(data.toString().indexOf('[') != -1) {
            move(client, data.toString());
        }
    });
}

function move(client, message) {
    var position = message.indexOf('[');
    console.log(position);
    if(position != -1) {
        var parseString = message.slice(position, message.length),
            newArray = JSON.parse(parseString),
            gameId = newArray[0],
            combinatons = newArray[1],
            field = newArray[2],
            current  = newArray[3];

        setField(field);

        var length = combinatons.length,
            value = Math.floor(Math.random()*length),
            combination = combinatons.splice(value, 1)[0];
        field[combination[0]][combination[1]] = current;

        setField(field);

        data = [];
        data.push(gameId);
        data.push(combination);
        data.push(combinatons);
        data.push(field);
        data.push(current);

        var str = JSON.stringify(data);
        client.write(str);
    }
}