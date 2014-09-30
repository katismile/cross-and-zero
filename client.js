var net = require('net');

var argv = require('optimist').argv;

if (argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
} else {
    createSocket();
}

function createSocket() {
    var client = new net.Socket({
        writable: true
    });

    client.connect(7777, function() {
        client.write('Hello Server!');
    });

    client.on('data', function(data) {
        var message = data.toString();
        if (data.toString().indexOf('winner') !== -1 || data.toString().indexOf('lost') !== -1 || data.toString().indexOf('left') !== -1) {
            console.log(data.toString());
        }
        if (message.indexOf('[') !== -1) {
            //console.log(message);
            var parseMessage = JSON.parse(message);
                setTimeout(function(){
                    var gameId = parseMessage[0];
                    var combinations = parseMessage[1];
                    var length = combinations.length;
                    var value = Math.floor(Math.random()*length);
                    var combination = combinations.splice(value, 1)[0];
                    var senddata = [];
                    senddata.push(gameId);
                    senddata.push(combination);
                    senddata.push(combinations);

                    var str = JSON.stringify(senddata);
                    client.write(str);
                }, 2000)

            }

    });
}

