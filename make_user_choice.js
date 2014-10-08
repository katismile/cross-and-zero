var inquirer = require('inquirer');
module.exports = function(gameId, combinations, client) {
    var data = {};
    var choices = [];

    for(var i = 0; i < combinations.length; i++) {
        choices.push(JSON.stringify(combinations[i]));
    }
    inquirer.prompt([
        {
            type: 'list',
            name: 'position',
            message: 'Choose position',
            choices: choices
        }
    ], function (answer) {
        var combination = answer.position;
        for(var i = 0; i < combinations.length; i++){
            if(combinations[i] + "" == JSON.parse(combination)){
                combinations.splice(i, 1)
            }
        }
        data.id = gameId;
        data.combination = JSON.parse(combination);
        data.combinations = combinations;
        var str = {
            setting: 'make move',
            data: data
        };
        client.write(JSON.stringify(str));
    });
};