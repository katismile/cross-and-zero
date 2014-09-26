var net = require('net');
var socket = new net.Socket();

socket.connect(7777, function(){
});

socket.on('data', function(data){
    if(data.toString().indexOf('move') !== -1){
        var message = data.toString();
        var pos = message.indexOf('[');
        var comb = message.slice(pos, message.length);
        var combinations = JSON.parse(comb);
        var index = Math.floor(Math.random()*combinations.length);
        console.log(combinations[index]);
    }
});
