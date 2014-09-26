var net = require('net'),
    move = require('./move');

var client = new net.Socket();

client.connect(7777, function() {
    client.write('Hello Server, I am Cross');
});

client.on('data', function(data) {
    move(client, data.toString());
});