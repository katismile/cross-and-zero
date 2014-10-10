var Table = require('cli-table');
module.exports = function (array) {
    var chars = { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
        , 'right': '║' , 'right-mid': '╢' , 'middle': '│' };
    var table = new Table ({ chars: chars });
    for (var i = 0; i < array.length; i++) {
        table.push(array[i]);
    }
    return table.toString();
};