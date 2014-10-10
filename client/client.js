var net = require('net');
var argv = require('optimist').argv;
var requestHandler = require('./controller');
var User = require('./user');
var Bot = require('./bot');
var user = new User();
var bot = new Bot();
var makeChoice;
var chooseSuit;
if (argv.c) {
    for (var j = 0; j < argv.c; j++) {
        createSocket();
    }
} else {
    createSocket();
}
function createSocket () {
    var client = new net.Socket( {
        writable: true
    });
    client.connect(7777);
    if (argv._[0] === 'isBot') {
        makeChoice = bot.makeChoice;
        chooseSuit = bot.chooseSuit;
    } else {
        makeChoice = user.makeChoice;
        chooseSuit = user.chooseSuit;
    }
    client.on('data', function onData (data) {
        var message = JSON.parse(data.toString());
        var opt = {
            message: message,
            makeChoice: makeChoice,
            chooseSuit: chooseSuit,
            client: client
        };
        requestHandler[message["type"]](opt);
    });
}