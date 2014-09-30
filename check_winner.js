module.exports = function (field) {
    if (field[0][0] !== ' ' && field[1][0] !== ' ' && field[2][0] !== ' ' && field[0][0] == field[1][0] && field[1][0] == field[2][0]) {
        return true;
    }
    if (field[0][1] !== ' ' && field[1][1] !== ' ' && field[2][1] !== ' ' && field[0][1] == field[1][1] && field[1][1] == field[2][1]) {
        return true;
    }
    if (field[0][2] !== ' ' && field[1][2] !== ' ' && field[2][2] !== ' ' && field[0][2] == field[1][2] && field[1][2] == field[2][2]) {
        return true;
    }
    if (field[0][0] !== ' ' && field[1][1] !== ' ' && field[2][2] !== ' ' && field[0][0] == field[1][1] && field[1][1] == field[2][2]) {
        return true;
    }
    if (field[0][2] !== ' ' && field[1][1] !== ' ' && field[2][0] !== ' ' && field[0][2] == field[1][1] && field[1][1] == field[2][0]) {
        return true;
    }
    else {
        for(var i = 0; i < field.length; i ++) {
            for (var j = 0; j < field[i].length; j++) {
                if(field[i][j] === field[i][j + 1] && field[i][j + 1] == field[i][j + 2] && field[i][j] !== ' ' && field[i][j + 1] !== ' ' && field[i][j + 2] !== ' ') {
                    return true;
                }
            }
        }
    }
    return false;
};