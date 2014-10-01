var net = require('net'),
    move = require('./commands'),
    argv = require('optimist').argv,
    controller = require('./controller'),
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

            controller(commands, obj);
        }
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
        }
    });
}