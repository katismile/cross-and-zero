var Table = require('cli-table');

var ConsoleRender = function(){};
ConsoleRender.prototype.renderTable = function(field){
    var chars = { 'top': '═' , 'top-mid': '╤' , 'top-left': '╔' , 'top-right': '╗'
        , 'bottom': '═' , 'bottom-mid': '╧' , 'bottom-left': '╚' , 'bottom-right': '╝'
        , 'left': '║' , 'left-mid': '╟' , 'mid': '─' , 'mid-mid': '┼'
        , 'right': '║' , 'right-mid': '╢' , 'middle': '│' };
    var table = new Table ({ chars: chars });
    for (var i = 0; i < field.length; i++) {
        table.push(field[i]);
    }
    console.log(table.toString());
};
ConsoleRender.prototype.renderMessage = function(message){
    console.log(message);
};
module.exports = ConsoleRender;