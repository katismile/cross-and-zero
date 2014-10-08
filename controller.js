var drawTable = require('./draw_table');
var makeChoiceClient = require('./make_user_choice');
var makeChoiceBot = require('./make_bot_choice');
var inquirer = require('inquirer');

exports.finishMessage = function(message, client) {
    var winnerMessage = JSON.parse(message);
    console.log(drawTable(winnerMessage.field));
    console.log(winnerMessage.message);
    var newGame = {
        setting: 'new game'
    };
    client.write(JSON.stringify(newGame));
};
exports.choosePositionClient = function(message, client) {
    var parseMessage = JSON.parse(message);
    if(parseMessage.field){
        console.log(drawTable(parseMessage.field));
    }
    makeChoiceClient(parseMessage.id, parseMessage.combinations, client);
};
exports.choosePositionBot = function(message, client) {
    var parseMessage = JSON.parse(message);
    if(parseMessage.field){
        console.log(drawTable(parseMessage.field));
    }
    makeChoiceBot(parseMessage.id, parseMessage.combinations, client);
};
exports.disconnect = function(message) {
    var parseMessage = JSON.parse(message);
    console.log(parseMessage.message);
};

exports.ping = function(message, client){
    var pingMessage = {
        setting: 'ping'
    };
    client.write(JSON.stringify(pingMessage));
};
exports.chooseSuitBot = function(message, client){
    var parsed = JSON.parse(message);
    var comb = parsed.data.suits;
    var value = Math.floor(Math.random()*comb.length);
    var combination = comb.splice(value, 1)[0];
    var suitMessage = {
        setting: 'choose suit',
        data: {
            suits: comb,
            suit: combination
        }
    };
    client.write(JSON.stringify(suitMessage))
};
exports.chooseSuitClient = function(message, client){
    var parsed = JSON.parse(message);
    var comb = parsed.data.suits;
    inquirer.prompt([
        {
            type: 'list',
            name: 'suits',
            message: 'Choose suit',
            choices: comb
        }
    ], function (answer) {
        var combination = answer.suits;
        for(var i = 0; i < comb.length; i++){
            if(comb[i] + "" == combination){
                comb.splice(i, 1)
            }
        }
        var str = {
            setting: 'choose suit',
            data: {
                suits: comb,
                suit: combination
            }
        };
        client.write(JSON.stringify(str));
    });
};