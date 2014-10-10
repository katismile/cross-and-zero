var net = require('net');
var argv = require('optimist').argv;
var ConsoleRender = require('./console_render');
var ClientController = require('./client_controller');
var makeChoice;
var chooseSuit;

if (argv.c) {
    for (var j = 0; j < argv.c; j++) {
        createSocket();
    }
}
else {
    createSocket();
}

function createSocket () {
    var client = new net.Socket( {
        writable: true
    });
    client.connect(7777);
    if (argv._[0] === 'isBot') {
        makeChoice = require('./make_bot_choice');
        chooseSuit = require('./bot_suit');
    }
    else {
        makeChoice = require('./make_user_choice');
        chooseSuit = require('./user_suit')
    }
    var controller = new ClientController(client, new ConsoleRender());
    client.on('data', function onData (data) {
        var message = JSON.parse(data.toString());
        var requestHandler = {
            'finish message': function () {
                controller.finishMessage (message);
            },
            'choose position': function () {
                controller.choosePosition (message, makeChoice)
            },
            'opponent exit': function () {
                controller.disconnect (message)
            },
            'ping': function () {
                controller.ping ()
            },
            'choose suit': function () {
                controller.chooseSuit (message, chooseSuit);
            }
        };
        requestHandler[message["type"]]();
    });
}