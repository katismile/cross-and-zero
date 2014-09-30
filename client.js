inquirer = require('inquirer');

module.exports = function move(client, message) {
    var position = message.indexOf('[');
    if(position != -1) {
        var parseString = message.slice(position, message.length);
        console.log("parseString " + parseString);
        newArray = JSON.parse(parseString);
        gameId = newArray[0];
        combinatons = newArray[1];

        var choices = [];

        for(var i = 0; i < combinatons.length; i++) {
            choices.push(JSON.stringify(combinatons[i]));
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

            for(var j = 0; j < combinatons.length; j++) {
                if( combinatons[j] + "" == JSON.parse(combination) ) {
                    combinatons.splice(j,1);
                }
            }
            data = [];
            data.push(gameId);
            data.push(JSON.parse(combination));
            data.push(combinatons);

            var str = JSON.stringify(data);
            client.write(str);

        });
    }
};