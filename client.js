var net = require('net'),
    move = require('./move'),
    argv = require('optimist').argv;

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
        console.log(data.toString());
        if(data.toString().indexOf('[') != -1) {
            move(client, data.toString());
        }
    });
}