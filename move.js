module.exports = function move(client, message) {
    var position = message.indexOf('[');
    console.log(position);
    if(position != -1) {
        var parseString = message.slice(position, message.length),
            combinatons = JSON.parse(parseString),
            length = combinatons.length,
            value = randomInt(0, length),
            combination = combinatons.splice(value, 1)[0],
            data = [];
        data.push(combination);
        data.push(combinatons);

        var str = JSON.stringify(data);

        console.log(str);
        client.write(str);

        function randomInt(min, max) {
            return min + ((max-min+1)*Math.random()^0);
        }
    }
};