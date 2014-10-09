module.exports = function (gameId, combinations, client) {
    setTimeout (function () {
        var length = combinations.length;
        var value = Math.floor (Math.random ()*length);
        var combination = combinations.splice(value, 1)[0];
        var data = {};
        data.id = gameId;
        data.combination = combination;
        data.combinations = combinations;
        var str = {
            setting: 'make move',
            data: data
        };
        client.write(JSON.stringify(str));
    }, 2000)
};