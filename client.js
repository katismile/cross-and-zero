var net = require('net');
var Table = require('cli-table');
var argv = require('optimist').argv;

if (argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
}
else {
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
        //console.log(message);
        if (message.indexOf('left') !== -1) {
            console.log(message);
        }
        else if(message.indexOf('winner') !== -1 || message.indexOf('lost') !== -1){
            var winnerMessage = JSON.parse(message);
            var table = new Table ({ chars: chars });
            table.push(winnerMessage[0][0], winnerMessage[0][1], winnerMessage[0][2]);
            console.log(table.toString());
            console.log(winnerMessage[1]);
        }
        else if (message.indexOf('[') !== -1) {
            var parseMessage = JSON.parse(message);
            if(parseMessage[2]){
                var table = new Table ({ chars: chars });
                table.push(parseMessage[2][0], parseMessage[2][1], parseMessage[2][2]);
                console.log(table.toString());
            }
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

var chars = { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
    , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
    , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
    , 'right': '║' , 'right-mid': '╢' , 'middle': '│' };