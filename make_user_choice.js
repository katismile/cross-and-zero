var inquirer = require('inquirer');
module.exports = function(gameId, combinations, client) {
    var senddata = [];
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
        senddata.push(gameId);
        senddata.push(JSON.parse(combination));
        senddata.push(combinations);
        client.write(JSON.stringify(senddata));
    });
};