var Bot = function(){};
Bot.prototype.makeChoice = function (gameId, combinations, client) {
    setTimeout (function onSetTimeOut () {
        var length = combinations.length;
        var value = Math.floor (Math.random ()*length);
        var combination = combinations.splice(value, 1)[0];
        var data = {};
        data.id = gameId;
        data.combination = combination;
        data.combinations = combinations;
        var str = {
            type : 'make move',
            data: data
        };
        client.write(JSON.stringify(str));
    }, 2000)
};
Bot.prototype.chooseSuit = function (message, client) {
    var comb = message.data.suits;
    var value = Math.floor (Math.random ()*comb.length);
    var combination = comb.splice(value, 1)[0];
    var suitMessage = {
        type: 'choose suit',
        data: {
            suits: comb,
            suit: combination
        }
    };
    client.write(JSON.stringify(suitMessage))
};
module.exports = Bot;