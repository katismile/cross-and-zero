var net = require('net'),
    argv = require('optimist').argv,
    tik_tak_toe = require('./tik_tak_toe'),
    controller = require('./controller_for_client'),
    inquirer = require('inquirer');

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

    client.connect(7777, function() {
        client.write(JSON.stringify('Hello Server!'));
    });

    client.on('data', function(data) {

        if(typeof JSON.parse(data.toString()) === 'object') {
            obj = JSON.parse(data.toString());

            move(client, obj);
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
        current  = message.current,
        socketsNames = message.socketsName;

        var setField =  message.isSmall ? "setSmallField" : "setBigField";

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

            message['combination'] = JSON.parse(combination);
            message['combinations'] = combinations;
            message['field'] = field;


            var obj = {
                action: "check",
                data: message
            };
            client.write(JSON.stringify(obj));
        });
}