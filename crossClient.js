var net = require('net');

var client = new net.Socket();

client.connect(7777, function() {
    client.write('Hello Server, I am Cross');
});

client.on('data', function(data) {
    if(data.toString().indexOf('winner') !== -1 || data.toString().indexOf('lost')){
        console.log(data.toString());
    }

    var message = data.toString();
    var position = message.indexOf('[');
    if(position != -1) {
        var parseString = message.slice(position, message.length),
            combinatons = JSON.parse(parseString),
            length = combinatons.length,
            value = Math.floor(Math.random()*length),
            combination = combinatons.splice(value, 1)[0],
            postdata = [];
        postdata.push(combination);
        postdata.push(combinatons);
        var str = JSON.stringify(postdata);
        console.log(str);
        client.write(str);
    }
});
