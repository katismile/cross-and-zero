var net = require('net');
    client = new net.Socket();

client.connect(7777, function() {
    client.write('Hello Server, I am Zero');
});

client.on('data', function(data) {
    console.log(data.toString());
    run(data.toString());
});

var combinations = [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 0],
    [1, 1],
    [1, 2],
    [2, 0],
    [2, 1],
    [2, 2]
];

function run(message) {
    if(message.toLowerCase().indexOf('zero')) {
        var value = randomInt(0, 9);
        var combination = combinations.slice(value++, value)[0];
        var str = "Cross move " + combination[0] + "," + combination[1];
        console.log(str);
        console.log(combination[0]);
        console.log(combination[1]);
        client.write('Zero moved ' + str);
    }
}

function randomInt(min, max) {
    return min + ((max-min+1)*Math.random()^0);
}