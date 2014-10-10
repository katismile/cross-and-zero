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
                current  = options.current;

            var setField =  options.isSmall ? "setSmallField" : "setBigField";

            tik_tak_toe[setField](field, options.socketsName);

            var length = combinations.length,
                value = Math.floor(Math.random()*length),
                combination = combinations.splice(value, 1)[0];
            field[combination[0]][combination[1]] = current;

            tik_tak_toe[setField](field, options.socketsName);

            options['combination'] = combination;
            options['combinations'] = combinations;
            options['field'] = field;

            var client =  options.client;
            options.client = null;

            var someData = {
                action: "check",
                data: options
            };

            client.write(JSON.stringify(someData));
        }, 3000);
    }
};