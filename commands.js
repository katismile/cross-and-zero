var inquirer = require('inquirer'),
    Table = require('cli-table');

module.exports = {
    move: function (message) {
        console.log(message);
        var gameId = message.gameId,
            combinations = message.combinations,
            field = message.field,
            current = message.current,
            self = this;

        this.setField(field);

        var choices = [];

        for (var i = 0; i < combinations.length; i++) {
            choices.push(JSON.stringify(combinations[i]));
        }

        inquirer.prompt([
            {
                type: "list",
                name: "position",
                message: "Please, choose position",
                choices: choices
            }
        ], function (answer) {
            var combination = answer.position;
            field[JSON.parse(combination)[0]][JSON.parse(combination)[1]] = current;

            self.setField(field);

            for (var j = 0; j < combinations.length; j++) {
                if (combinations[j] + "" == JSON.parse(combination)) {
                    combinations.splice(j, 1);
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

    },
    setField: function (field) {

        var table = new Table({
            chars: { 'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗', 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼', 'right': '║', 'right-mid': '╢', 'middle': '│' }
        });

        array = [];

        for (var i = 0; i < field.length; i++) {
            var newArr = [];
            for (var j = 0; j < 3; j++) {
                if (field[i][j] != undefined) {
                    if (field[i][j] == 0) {
                        newArr.push('X');
                    }
                    if (field[i][j] == 1) {
                        newArr.push('O');
                    }
                } else {
                    newArr.push('');
                }
            }
            array.push(newArr);
        }
        table.push(
            array[0]
            , array[1]
            , array[2]
        );
        console.log(table.toString());
    }
};
