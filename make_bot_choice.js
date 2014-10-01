module.exports = function (gameId, combinations, client) {
    setTimeout(function(){
        var length = combinations.length;
        var value = Math.floor(Math.random()*length);
        var combination = combinations.splice(value, 1)[0];
        var senddata = [];
        senddata.push(gameId);
        senddata.push(combination);
        senddata.push(combinations);
        var str = JSON.stringify(senddata);
        client.write(str);
    }, 2000)
};