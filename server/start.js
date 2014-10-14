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
    if (typeof sockets['x'] !== 'undefined') {
        current = 'x';
    }
    else if (typeof sockets['0'] !== 'undefined') {
        current = '0';
    }
    else if (typeof sockets['y'] !== 'undefined') {
        current = 'y';
    }
    console.log("start" + sockets);
    games[i] = new Game (i, combinations, field, sockets, current);
    var message = {
        type: 'choose position',
        id: games[i].id,
        combinations: games[i].combinations,
        field: games[i].field
    };
    redis.publish(channel, JSON.stringify([games[i].sockets[games[i].current], message]));
};