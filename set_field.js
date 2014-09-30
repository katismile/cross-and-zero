var Table = require('cli-table');

module.exports = function setField(field) {

    var table = new Table({
        chars: { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
            , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
            , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
            , 'right': '║' , 'right-mid': '╢' , 'middle': '│' }
    });

    array = [];

    for(var i = 0; i<field.length; i++) {
        var newArr = [];
        for(var j = 0; j < 3; j++) {
            if(field[i][j] != undefined) {
                if(field[i][j] == 0) {
                    newArr.push('X');
                }
                if(field[i][j] == 1) {
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
};