var redis = require('redis').createClient(),
    pub = require('redis').createClient(),
    Table = require('cli-table'),
    inquirer = require('inquirer');

var TikTakToe = {
    sockets: [],
    games: [],
    i: 0,
    start: function(data) {
        var socketsName = {
            0 : 'Cross',
            1: 'Zeroes'
        };
        var combinations = [
            [0, 0],
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 1],
            [1, 2],
            [2, 0],
            [2, 1],
            [2, 2]
        ];
        var field = [[],[],[]];
        console.log(data.sockets);

        var couple = data.sockets;
        console.log("Game " + this.i + " is started!");
        this.games[this.i] = new this.createGame(this.i, combinations, field, socketsName, couple);

        console.log(this.games[this.i]);
        pub.publish('game', JSON.stringify(this.games[this.i]));

        //this.games[this.i].sockets[0].write(JSON.stringify(message));
        this.i++;
    },
    setPosition: function(obj) {
        console.log('fffffffff set position');
        if(!obj.combination) {
            return;
        }
        var position1 = obj.combination[0],
            position2 = obj.combination[1];
        obj.field[position1][position2] =  obj.current;

        this.setField(obj.field);
    },
    checkWinner: function(field) {
        if (field[0][0] !== undefined && field[1][0] !== undefined && field[2][0] !== undefined && field[0][0] == field[1][0] && field[1][0] == field[2][0]) {
            return true;
        }
        if (field[0][1] !== undefined && field[1][1] !== undefined && field[2][1] !== undefined && field[0][1] == field[1][1] && field[1][1] == field[2][1]) {
            return true;
        }
        if (field[0][2] !== undefined && field[1][2] !== undefined && field[2][2] !== undefined && field[0][2] == field[1][2] && field[1][2] == field[2][2]) {
            return true;
        }
        if (field[0][0] !== undefined && field[1][1] !== undefined && field[2][2] !== undefined && field[0][0] == field[1][1] && field[1][1] == field[2][2]) {
            return true;
        }
        if (field[0][2] !== undefined && field[1][1] !== undefined && field[2][0] !== undefined && field[0][2] == field[1][1] && field[1][1] == field[2][0]) {
            return true;
        }
        else {
            for(var i = 0; i < field.length; i ++) {
                for (var j = 0; j < field[i].length; j++) {
                    if(field[i][j] === field[i][j + 1] && field[i][j + 1] == field[i][j + 2]) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    createGame: function(id, combinations, field, socketsName, sockets) {
        this.id = id;
        this.combinations = combinations;
        this.field = field;
        this.current = 0;
        this.socketsName = socketsName;
        this.sockets = sockets
    },
    check: function(message) {
        console.log('moveeeeeeeeeeee');
        console.log(message);

        var id = message.id;

        if(!message.combination) {
            return;
        }

        if( TikTakToe.games[id] &&  TikTakToe.games[id].combinations.length >=0){
            var combination = message.combination;
            TikTakToe.games[id].combinations = message.combinations;
            if(combination.length == 2){
                TikTakToe.setPosition( TikTakToe.games[id].current,  TikTakToe.games[id].field, combination);

                if(TikTakToe.checkWinner( TikTakToe.games[id].field)){
                    for(var k = 0; k <  TikTakToe.games[id].sockets.length; k++){
                        console.log('The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current]);
                    }
                }
                if( !TikTakToe.checkWinner( TikTakToe.games[id].field) &&  TikTakToe.games[id].combinations.length == 0){
                    for(var j = 0; j <  TikTakToe.games[id].sockets.length; j++){
                        console.log('The game is finished, you both lost');
                    }
                }
            }
        }
    },
    controller: function(message) {

        if(typeof this[message.type] === 'function') {
            this[message.type](message);
        }
    },
    clientMove: function (message) {
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
module.exports = TikTakToe;