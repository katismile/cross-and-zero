module.exports = function check(field) {
    for (var i = 0; i < field.length; ) {
        var first = field[i][i];
        var innerLength = field[0].length;
        var j = 0;
        var rowFlag = true;
        var colFlag = true;
        while (j < innerLength) {
            rowFlag = rowFlag && first == field[i][j] && field[i][j] !== ' ' && first !== ' ';
            colFlag = colFlag && first == field[j][i] && field[j][i] !== ' ' && first !== ' ';;
            j++;
        }
        if (rowFlag || colFlag) {
            return true;
        }
        i++;
    }
    var diagonal1 = true;
    var diagonal2 = true;
    for (var k = 0; k < field.length; ) {
        var firsts = field[0][0];
        diagonal1 = diagonal1 && firsts == field[k][k] && field[k][k] !== ' ' && firsts !== ' ';
        k++;
    }
    var len = field.length - 1;
    for (var l = 0; l < field.length; ) {
        var f = field[field.length - 1][0];
        diagonal2 = diagonal2 && f == field[len][l] && field[len][l] !==' ' && f !== ' ';
        len--;
        l++
    }
    return diagonal1 || diagonal2;
};