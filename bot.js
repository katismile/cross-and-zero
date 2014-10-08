var net = require('net'),
    argv = require('optimist').argv,
    tik_tak_toe = require('./tik_tak_toe'),
    inquirer = require('inquirer'),
    controller = require('./controller_for_client');

if(argv.c) {
    for(var j = 0; j < argv.c; j++) {
        createSocket();
    }
} else {
    createSocket();
}
var figures = ['X', 'O', 'Y'];

function createSocket() {
    var client = new net.Socket( {
        allowHalfOpen: true,
        readable: true,
        writable: true
    });

    client.connect(7777, function(next) {

        inquirer.prompt([
            {
                type: "list",
                name: "figure",
                message: "What figure do you want to play?",
                choices: figures
            }
        ], function( answer ) {

            var obj = {
                action: 'saveFigure',
                forServer: true,
                data: {
                    figure: answer.figure
                }
            };

            client.write(JSON.stringify(obj));
        });
        //client.write(JSON.stringify('Hello Server!'));
    });

    client.on('data', function(data) {

        if(typeof JSON.parse(data.toString()) === 'object') {
            obj = JSON.parse(data.toString());

            setTimeout(function() {
                move(client, obj);
            }, 500);

        }
        if(typeof JSON.parse(data.toString()) === 'string') {
            console.log(JSON.parse(data.toString()));

            var action = JSON.parse(data.toString()),
                options = {
                    client: client
                };

            if(typeof controller[action] === 'function') {
                controller[action](options);
            }
        }
    });
}

function move(client, message) {

    var combinations = message.combinations,
        field = message.field,
        current  = message.current;

    var setField =  message.isSmall ? "setSmallField" : "setBigField";


    //tik_tak_toe[setField](field);

    var length = combinations.length,
        value = Math.floor(Math.random()*length),
        combination = combinations.splice(value, 1)[0];
    field[combination[0]][combination[1]] = current;

    //tik_tak_toe[setField](field);

    message['combination'] = combination;
    message['combinations'] = combinations;
    message['field'] = field;

    var obj = {
        action: "check",
        data: message
    };
    client.write(JSON.stringify(obj));
}
