module.exports = function move(client, message) {
    var position = message.indexOf('[');
    console.log(position);
    if(position != -1) {
        var parseString = message.slice(position, message.length),
            combinatons = JSON.parse(parseString),
            length = combinatons.length,
            value = Math.floor(Math.random()*length),
            combination = combinatons.splice(value, 1)[0],
            data = [];
        data.push(combination);
        data.push(combinatons);

        var str = JSON.stringify(data);
        client.write(str);
    }
};