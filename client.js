var net = require('net'),
    argv = require('optimist').argv,
    tik_tak_toe = require('./tik_tak_toe'),
    controller = require('./controller'),
    inquirer = require('inquirer');

if(argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
} else {
    createSocket();
}
var figures = ['X', 'O', 'Y'];

function createSocket() {
    var client = new net.Socket( {
        allowHalfOpen: false,
        readable: true,
        writable: true
    });

    client.connect(7777, function() {
        client.write(JSON.stringify('Hello Server!'));
    });

    client.on('data', function(data) {
        var options = {};

        if(typeof JSON.parse(data.toString()) === 'object') {

            var action = JSON.parse(data.toString()).action;

            if(JSON.parse(data.toString()).data) {
                options = JSON.parse(data.toString()).data;
            }
            options.client = client;

            if(typeof controller[action] === 'function') {
                controller[action](options);
            }
        }

        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));
        }
    });
    client.on('close', function(){
        process.exit();
    });
}
