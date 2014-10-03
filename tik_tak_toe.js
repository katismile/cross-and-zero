var redis = require('redis').createClient(),
    pub = require('redis').createClient(),
    Table = require('cli-table'),
    inquirer = require('inquirer');

var TikTakToe = {
    sockets: [],
    games: [],
    i: 0,
    start: function(options) {
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

        var couple = options.sockets;
        console.log("Game " + this.i + " is started!");
        this.games[this.i] = new this.createGame(this.i, combinations, field, socketsName, couple);

        pub.publish('game', JSON.stringify(this.games[this.i]));

        this.i++;
    },
    setPosition: function(current, field, combination) {

        var position1 = combination[0],
            position2 = combination[1];
        field[position1][position2] =  current;

        this.setField(field);
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

    check: function(options) {
        var id = options.id;
        var combination = options.combination;

        if( combination.length == 2 &&  TikTakToe.games[id].combinations.length >=0){
            TikTakToe.games[id].combinations = options.combinations;
            TikTakToe.setPosition( TikTakToe.games[id].current,  TikTakToe.games[id].field, combination);

            if(TikTakToe.checkWinner( TikTakToe.games[id].field)){
                options.message = 'The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current];

                pub.publish('finish', JSON.stringify(options));

            } else if (!TikTakToe.checkWinner( TikTakToe.games[id].field) &&  TikTakToe.games[id].combinations.length == 0){
                options.message = 'The game is finished, you both lost';

                pub.publish('finish', JSON.stringify(options));

            } else {

                TikTakToe.games[id].current =  TikTakToe.games[id].current ? 0 : 1;
                options.current = TikTakToe.games[id].current;

                pub.publish('game', JSON.stringify(options));
            }
        }
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