var net = require('net');

var client = new net.Socket();

client.connect(7777, function() {
    //client.write('Hello, server');
});

client.on('data', function(data) {
    console.log(data.toString());
    if(data.toString().indexOf('winner') !== -1 || data.toString().indexOf('lost')){
        //console.log(data.toString());
    }
    var message = data.toString();
    if(message.indexOf('[') != -1) {
        var parseString = JSON.parse(message),
            combinatons = parseString[1],
            id = parseString[0],
            length = combinatons.length,
            value = Math.floor(Math.random()*length),
            combination = combinatons.splice(value, 1)[0],
            data = [];
        data.push(id);
        data.push(combination);
        data.push(combinatons);
        console.log(data);
        var str = JSON.stringify(data);
        console.log(str);
        client.write(str);
    }
});