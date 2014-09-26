var net = require('net');

var client = new net.Socket();

client.connect(7777, function() {
});

client.on('data', function(data) {
    var message = data.toString();
    var position = message.indexOf('[');
    if(position != -1) {
        var parseString = message.slice(position, message.length),
            combinatons = JSON.parse(parseString),
            length = combinatons.length,
            value = Math.floor(Math.random()*length),
            combination = combinatons.splice(value, 1)[0],
            data = [];
        data.push(combination);
        data.push(combinatons);

        var str = JSON.stringify(data);

        console.log(str);
        client.write(str);

        function randomInt(min, max) {
            return min + ((max-min+1)*Math.random()^0);
        }
    }
});
