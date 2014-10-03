var drawTable = require('./draw_table');
var makeChoiceClient = require('./make_user_choice');
var makeChoiceBot = require('./make_bot_choice');

exports.finishMessage = function(message, client) {
    var winnerMessage = JSON.parse(message);
    console.log(drawTable(winnerMessage.field));
    console.log(winnerMessage.message);
    client.end();
};
exports.choosePositionClient = function(message, client) {
    var parseMessage = JSON.parse(message);
    if(parseMessage.field){
        console.log(drawTable(parseMessage.field));
    }
    makeChoiceClient(parseMessage.id, parseMessage.combinations, client);
};
exports.choosePositionBot = function(message, client) {
    var parseMessage = JSON.parse(message);
    if(parseMessage.field){
        console.log(drawTable(parseMessage.field));
    }
    makeChoiceBot(parseMessage.id, parseMessage.combinations, client);
};
exports.disconnect = function(message) {
    var parseMessage = JSON.parse(message);
    console.log(parseMessage.message);
};