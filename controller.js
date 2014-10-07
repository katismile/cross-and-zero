var drawTable = require('./draw_table');
var makeChoiceClient = require('./make_user_choice');
var makeChoiceBot = require('./make_bot_choice');

exports.finishMessage = function(message, client) {
    var winnerMessage = JSON.parse(message);
    console.log(drawTable(winnerMessage.field));
    console.log(winnerMessage.message);
    client.write('new game');
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

exports.ping = function(message, client){
    client.write('ping');
};
exports.chooseSuit = function(message, client){
    console.log(JSON.parse(message));
    var parsed = JSON.parse(message);
    var comb = parsed.data.suits;
    var value = Math.floor(Math.random()*comb.length);
    var combination = comb.splice(value, 1)[0];
    var suitMessage = {
        setting: 'choose suit',
        data: {
            suits: comb,
            suit: combination
        }
    };
    client.write(JSON.stringify(suitMessage))
};