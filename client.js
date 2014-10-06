var net = require('net');
var argv = require('optimist').argv;
var controller = require('./controller');

if (argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
}
else {
    createSocket();
}
function createSocket() {
    var client = new net.Socket( {
        writable: true
    });
    client.connect(7777, function() {
        client.write('Hello Server!');
    });
    client.on('data', function(data) {
        var message = data.toString();
        var requestHandler = {
            'finish message': function() {
                controller.finishMessage(message, client);
            },
            'choose position': function() {
                controller.choosePositionClient(message, client)
            },
            'opponent exit': function() {
                controller.disconnect(message)
            },
            'ping': function(){
                controller.ping(message, client)
            }
        };
        var parsed = JSON.parse(message);
        requestHandler[parsed["setting"]]();
    });
}

