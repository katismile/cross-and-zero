var net = require('net');

var argv = require('optimist').argv;

if(argv.c) {
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
<<<<<<< HEAD
        if(data.toString().indexOf('winner') !== -1 || data.toString().indexOf('lost') !== -1){
=======
        if(data.toString().indexOf('winner') !== -1 || data.toString().indexOf('lost')){
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
            console.log(data.toString());
        }
        if(data.toString().indexOf('[') != -1) {
            var message = data.toString();
            var position = message.indexOf('[');
            if(position != -1) {
                setTimeout(function(){
                    var parseString = message.slice(position, message.length);
<<<<<<< HEAD
=======
                    console.log("parseString " + parseString);
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
                    var newArray = JSON.parse(parseString);
                    var gameId = newArray[0];
                    var combinatons = newArray[1];
                    var length = combinatons.length;
                    var value = Math.floor(Math.random()*length);
                    var combination = combinatons.splice(value, 1)[0];
                    var senddata = [];
                    senddata.push(gameId);
                    senddata.push(combination);
                    senddata.push(combinatons);

                    var str = JSON.stringify(senddata);
                    client.write(str);
                }, 2000)

            }
        }
    });

<<<<<<< HEAD
}
=======
}
>>>>>>> c04ffb733e1b54392226a74de2a1aa68a94a58b4
