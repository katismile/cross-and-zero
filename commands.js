var inquirer = require('inquirer'),
    setField = require('./set_field');

module.exports = {
    move: function(message) {
        console.log(message);
        var gameId = message.gameId,
        combinations = message.combinations,
        field = message.field,
        current  = message.current;

        setField(field);

        var choices = [];

        for(var i = 0; i < combinations.length; i++) {
            choices.push(JSON.stringify(combinations[i]));
        }

        inquirer.prompt([
            {
                type: "list",
                name: "position",
                message: "Please, choose position",
                choices: choices
            }
        ], function( answer ) {
            var combination = answer.position;
            field[JSON.parse(combination)[0]][JSON.parse(combination)[1]] = current;

            setField(field);

            for(var j = 0; j < combinations.length; j++) {
                if( combinations[j] + "" == JSON.parse(combination) ) {
                    combinations.splice(j,1);
                }
            }

            var newMessage = {
                type: "move",
                gameId: gameId,
                combination: JSON.parse(combination),
                combinations: combinations,
                field: field,
                current: current
            };
            message.client.write(JSON.stringify(newMessage));
        });

    }
};
