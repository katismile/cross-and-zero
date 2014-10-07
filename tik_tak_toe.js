var pub = require('redis').createClient(),
    Table = require('cli-table');

var TikTakToe = {
    sockets: [],
    games: [],
    start: function(options) {

        var socketsName = {
            0 : 'Cross',
            1: 'Zeroes',
            2: 'YYYYYY'
        };
        var combinationsBig = [
            [0, 0],
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
            [1, 0],
            [1, 1],
            [1, 2],
            [1, 3],
            [1, 4],
            [2, 0],
            [2, 1],
            [2, 2],
            [2, 3],
            [2, 4],
            [3, 0],
            [3, 1],
            [3, 2],
            [3, 3],
            [3, 4],
            [4, 0],
            [4, 1],
            [4, 2],
            [4, 3],
            [4, 4]
        ];
        var fieldBig = [[],[],[],[],[]];

        var combinationsSmall = [
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
        var fieldSmall = [[],[],[]];

        var players = options.sockets;
        console.log("Game " + options.gameId + " is started!");

        if(players.length == 2) {
            this.games[options.gameId] = new this.createGame(options.gameId, combinationsSmall, fieldSmall, socketsName, players);
            this.games[options.gameId].isSmall = true;
            pub.publish('game', JSON.stringify(this.games[options.gameId]));
        }
        if(players.length == 3) {
            this.games[options.gameId] = new this.createGame(options.gameId, combinationsBig, fieldBig, socketsName, players);
            this.games[options.gameId].isSmall = false;
            pub.publish('game', JSON.stringify(this.games[options.gameId]));
        }
    },
    setPosition: function(current, field, combination) {

        var position1 = combination[0],
            position2 = combination[1];
        field[position1][position2] =  current;
    },
    checkWinnerBigField: function(field) {
        if (field[0][0] !== undefined && field[1][0] !== undefined && field[2][0] !== undefined && field[3][0] !== undefined && field[4][0] !== undefined && field[0][0] == field[1][0] && field[1][0] == field[2][0] && field[2][0] == field[3][0] && field[3][0] == field[4][0]) {
            return true;
        }
        if (field[0][1] !== undefined && field[1][1] !== undefined && field[2][1] !== undefined && field[3][1] !== undefined && field[4][1] !== undefined && field[0][1] == field[1][1] && field[1][1] == field[2][1] && field[2][1] == field[3][1] && field[3][1] == field[4][1]) {
            return true;
        }
        if (field[0][2] !== undefined && field[1][2] !== undefined && field[2][2] !== undefined && field[3][2] !== undefined && field[4][2] !== undefined && field[0][2] == field[1][2] && field[1][2] == field[2][2] && field[2][2] == field[3][2] && field[3][2] == field[4][2]) {
            return true;
        }
        if (field[0][3] !== undefined && field[1][3] !== undefined && field[2][3] !== undefined && field[3][3] !== undefined && field[4][3] !== undefined && field[0][3] == field[1][3] && field[1][3] == field[2][3] && field[2][3] == field[3][3] && field[3][3] == field[4][3]) {
            return true;
        }
        if (field[0][4] !== undefined && field[1][4] !== undefined && field[2][4] !== undefined && field[3][4] !== undefined && field[4][4] !== undefined && field[0][4] == field[1][4] && field[1][4] == field[2][4] && field[2][4] == field[3][4] && field[3][4] == field[4][4]) {
            return true;
        }
        if (field[0][0] !== undefined && field[1][1] !== undefined && field[2][2] !== undefined && field[3][3] !== undefined && field[4][4] !== undefined && field[0][0] == field[1][1] && field[1][1] == field[2][2] && field[2][2] == field[3][3] && field[3][3] == field[4][4]) {
            return true;
        }
        if (field[0][4] !== undefined && field[1][3] !== undefined && field[2][2] !== undefined && field[3][1] !== undefined && field[4][0] !== undefined && field[0][4] == field[1][3] && field[1][3] == field[2][2] && field[2][2] == field[3][1] && field[3][1] == field[4][0]) {
            return true;
        }
        else {
            for(var i = 0; i < field.length; i ++) {
                for (var j = 0; j < field[i].length; j++) {
                    if(field[i][j] === field[i][j + 1] && field[i][j + 1] == field[i][j + 2] && field[i][j + 2] == field[i][j + 3] && field[i][j + 3] == field[i][j + 4]) {
                        return true;
                    }
                }
            }
        }
        return false;
    },
    checkWinnerSmallField: function(field) {
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
    createGame: function(id, combinations, field, socketsName, players) {
        this.id = id;
        this.combinations = combinations;
        this.field = field;
        this.current = 0;
        this.socketsName = socketsName;
        this.sockets = players
    },

    check: function(options) {
        var id = options.id;
        var combination = options.combination;

        var checkWinner = options.isSmall ? "checkWinnerSmallField" : "checkWinnerBigField";
        var setField = options.isSmall ? "setSmallField" : "setBigField";
        console.log(checkWinner);

        if(this.games[id]) {
            if( combination.length == 2 &&  this.games[id].combinations.length >=0){
                this.games[id].combinations = options.combinations;
                this.setPosition( this.games[id].current,  this.games[id].field, combination);

                this[setField](this.games[id].field);

                if(this[checkWinner]( this.games[id].field)){

                    options.message = 'The winner is ' +  this.games[id].socketsName[ this.games[id].current];
                    console.log(options.message);
                    pub.publish('finish', JSON.stringify(options));

                } else if (!this[checkWinner]( this.games[id].field) &&  this.games[id].combinations.length == 0){
                    options.message = 'The game is finished, you both lost';
                    console.log(options.message);
                    pub.publish('finish', JSON.stringify(options));

                } else {

                    this.games[id].current++;
                    if(this.games[id].current > this.games[id].sockets.length - 1) {
                        this.games[id].current = 0;
                    }
                    options.current = this.games[id].current;

                    pub.publish('game', JSON.stringify(options));
                }
            }
        }
    },

    setBigField: function (field) {

        var table = new Table({
            chars: { 'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗', 'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝', 'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼', 'right': '║', 'right-mid': '╢', 'middle': '│' }
        });

        array = [];

        for (var i = 0; i < field.length; i++) {
            var newArr = [];
            for (var j = 0; j < 5; j++) {
                if (field[i][j] != undefined) {
                    if (field[i][j] == 0) {
                        newArr.push('X');
                    }
                    if (field[i][j] == 1) {
                        newArr.push('O');
                    }
                    if (field[i][j] == 2) {
                        newArr.push('Y');
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
            , array[3]
            , array[4]
        );
        console.log(table.toString());
    },
    setSmallField: function(field) {
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
    },
    disconnect: function(options) {

        var gameId = options.gameId,
            socketId = options.socketId,
            data = {};
        console.log('game ' + this.games[gameId]);

        if(this.games[gameId]) {
            if(this.games[gameId].sockets.indexOf(socketId)) {
                var index = this.games[gameId].sockets.indexOf(socketId);
                this.games[gameId].sockets.splice(index, 1);

                data.sockets = this.games[gameId].sockets;
                console.log('tik tak toe    DISCONNECT');
                console.log(data.sockets.length + "   "  + data.sockets);
                pub.publish('restart', JSON.stringify(data));
            }
            this.games[gameId] = null;
        } else {
            data.socket = socketId;
            pub.publish('delete', JSON.stringify(data));
        }
    }
};
module.exports = TikTakToe;