var TikTakToe = {
    sockets: [],
    games: [],
    start: function(i) {
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
        var couple = this.sockets;
        this.sockets = [];
        console.log(field, i);
        this.games[i] = new this.createGame(i, combinations, field, socketsName, couple);
        console.log('current field: ' + this.games[i].field);
        var message = [this.games[i].id, this.games[i].combinations];
        this.games[i].sockets[0].write(JSON.stringify(message));
        i++;
    },
    setPosition: function(current, field, comb) {
        var position1 = comb[0],
            position2 = comb[1];
        field[position1][position2] = current;
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
    }
};
module.exports = TikTakToe;