var inquirer = require('inquirer');
module.exports = function (message, client) {
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