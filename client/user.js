var inquirer = require('inquirer');
var User = function(){};
User.prototype.makeChoice = function (gameId, combinations, client) {
    var data = {};
    var choices = [];
    for (var i = 0; i < combinations.length; i++) {
        choices.push(JSON.stringify(combinations[i]));
    }
    inquirer.prompt([
        {
            type: 'list',
            name: 'position',
            message: 'Choose position',
            choices: choices
        }
    ], function onAnswer (answer) {
        var combination = answer.position;
        for (var i = 0; i < combinations.length; i++) {
            if (combinations[i] + "" == JSON.parse(combination)) {
                combinations.splice(i, 1)
            }
        }
        data.id = gameId;
        data.combination = JSON.parse(combination);
        data.combinations = combinations;
        var str = {
            type : 'make move',
            data: data
        };
        client.write(JSON.stringify(str));
    });
};
User.prototype.chooseSuit = function (message, client) {
    var comb = message.data.suits;
    inquirer.prompt([
        {
            type: 'list',
            name: 'suits',
            message: 'Choose suit',
            choices: comb
        }
    ], function (answer) {
        var combination = answer.suits;
        for (var i = 0; i < comb.length; i++) {
            if (comb[i] + "" == combination) {
                comb.splice(i, 1)
            }
        }
        var str = {
            type: 'choose suit',
            data: {
                suits: comb,
                suit: combination
            }
        };
        client.write(JSON.stringify(str));
    });
};
module.exports = User;