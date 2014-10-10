module.exports = function (message, client) {
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