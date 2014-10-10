var drawTable = require('./draw_table');

var ConsoleRender = function(){};
ConsoleRender.prototype.renderTable = function(field){
    console.log(drawTable(field))
};
ConsoleRender.prototype.renderMessage = function(message){
    console.log(message);
};
module.exports = ConsoleRender;