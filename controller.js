var inquirer = require('inquirer'),
    figures = ['X', 'O', 'Y'],
    tik_tak_toe = require('./tik_tak_toe');

module.exports = {
    'choose figure': function(options) {

        inquirer.prompt([
            {
                type: "list",
                name: "figure",
                message: "What figure do you want to play?",
                choices: figures
            }
        ], function( answer ) {

            var obj = {
                action: 'save figure',
                forServer: true,
                data: {
                    figure: answer.figure
                }
            };

            options.client.write(JSON.stringify(obj));
        });
    },
    'ping': function(options) {
        if(options.client) {

            var obj = {
                action: 'ping',
                data: {
                    ping: 'ok'
                }
            };

            options.client.write(JSON.stringify(obj));
        }
    },
    'move': function (options) {

        setTimeout(function() {

            var combinations = options.combinations,
                field = options.field,
                current  = options.current,
                socketsNames = options.socketsName;

            var setField =  options.isSmall ? "setSmallField" : "setBigField";
            console.log()

            tik_tak_toe[setField](field, socketsNames);

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

                tik_tak_toe[setField](field, socketsNames);

                for(var j = 0; j < combinations.length; j++) {
                    if( combinations[j] + "" == JSON.parse(combination) ) {
                        combinations.splice(j,1);
                    }
                }

                options['combination'] = JSON.parse(combination);
                options['combinations'] = combinations;
                options['field'] = field;

                var client =  options.client;
                options.client = null;

                var someData = {
                    action: "check",
                    data: options
                };

                client.write(JSON.stringify(someData));

            });
        }, 3000);
    }
};
