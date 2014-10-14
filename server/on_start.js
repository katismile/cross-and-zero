var redis = require('redis').createClient();
module.exports = function (scope){
    scope.socketsLength = Object.keys(scope.sockets).length;
    for(var j = 0; j < Object.keys(scope.sockets).length; j ++){
        if( scope.socketsPool[scope.sockets[Object.keys(scope.sockets)[j]]]) {
            scope.socketsPool[scope.sockets[Object.keys(scope.sockets)[j]]].write(JSON.stringify({type: 'ping'}));
        }
    }
    setTimeout(function(){
        if(scope.pings.length > 1){
            var message = {
                type : 'start game',
                data : {
                    sockets : scope.sockets,
                    i : scope.i
                }
            };
            redis.lpush('tasks', JSON.stringify(message));
            scope.sockets = {};
            scope.i++;
            scope.pings = [];
            scope.suits = ['x', '0', 'y'];
        }
    }, 5000)
};