var Game = require('./game');
var redis = require('redis').createClient();
module.exports = function (games, i, sockets, channel) {
    var combinations = [];
    var field = [];
    var counter = Object.keys(sockets).length === 2 ? 3 : 5;
    for (var j = 0; j < counter; j++) {
        field.push([]);
        for (var k = 0; k < counter; k++) {
            combinations.push([j, k]);
            field[j].push(' ');
        }
    }
    var current;
    if (sockets['y']) current = 'y';
    if (sockets['0']) current = '0';
    if (sockets['x']) current = 'x';
    console.log("start");
    console.log(sockets);
    console.log(current);
    games[i] = new Game (i, combinations, field, sockets, current);
    var message = {
        type: 'choose position',
        id: games[i].id,
        combinations: games[i].combinations,
        field: games[i].field
    };
    redis.publish(channel, JSON.stringify([games[i].sockets[games[i].current], message]));
};