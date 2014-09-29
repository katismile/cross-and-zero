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
    var client = new net.Socket();

    client.connect(7777, function() {
        this.write('Hello Server!');
    });

    client.on('data', function(data) {
        if(data.toString().indexOf('[') != -1) {
            move(client, data.toString());
        }
    });
    client.on('end', function() {
        this.write('Disconnect to the server!');
    });
}