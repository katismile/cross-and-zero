var setField = require('./set_field');

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
        console.log("Game " + i + " is started!");
        this.games[i] = new this.createGame(i, combinations, field, socketsName, couple);
        var message = {
            type: "move",
            gameId: this.games[i].id,
            combinations: this.games[i].combinations,
            field: this.games[i].field,
            current: this.games[i].current
        };
        this.games[i].sockets[0].write(JSON.stringify(message));
    },
    setPosition: function(current, field, comb) {
        var position1 = comb[0],
            position2 = comb[1];
        field[position1][position2] = current;

        setField(field);
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
    move: function(message) {
        console.log(message);

        var id = message.gameId;

        if( TikTakToe.games[id] &&  TikTakToe.games[id].combinations.length >=0){
            var combination = message.combination;
            TikTakToe.games[id].combinations = message.combinations;
            if(combination.length == 2){
                TikTakToe.setPosition( TikTakToe.games[id].current,  TikTakToe.games[id].field, combination);

                if(TikTakToe.checkWinner( TikTakToe.games[id].field)){
                    for(var k = 0; k <  TikTakToe.games[id].sockets.length; k++){
                        console.log('The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current]);
                        TikTakToe.games[id].sockets[k].write(JSON.stringify('The winner is ' +  TikTakToe.games[id].socketsName[ TikTakToe.games[id].current]));
                    }
                }
                else if( !TikTakToe.checkWinner( TikTakToe.games[id].field) &&  TikTakToe.games[id].combinations.length == 0){
                    for(var j = 0; j <  TikTakToe.games[id].sockets.length; j++){
                        console.log('The game is finished, you both lost');
                        TikTakToe.games[id].sockets[j].write(JSON.stringify('The game is finished, both of you are lost'));
                    }
                }
                else{
                    TikTakToe.games[id].current =  TikTakToe.games[id].current ? 0 : 1;

                    var newMessage = {
                        type: "move",
                        gameId:  TikTakToe.games[id].id,
                        combinations:  TikTakToe.games[id].combinations,
                        field: TikTakToe.games[id].field,
                        current: TikTakToe.games[id].current
                    };

                    TikTakToe.games[id].sockets[ TikTakToe.games[id].current].write(JSON.stringify(newMessage));
                }
            }
        }
    },
    controller: function(message) {

        if(typeof this[message.type] === 'function') {
            console.log('tttttttttttttttttttttttttttt');
            this[message.type](message);
        }
    }

};
module.exports = TikTakToe;