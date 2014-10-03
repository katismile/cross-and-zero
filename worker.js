var redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    tik_tak_toe = require('./tik_tak_toe'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

var sockets = [];
var data = {
  sockets: []
};

sub.subscribe('sockets');

sub.on('message', function(channel, message) {
    console.log(message);
    data.sockets.push(message);

    if(data.sockets.length == 2) {
        var str = JSON.stringify('start');
        redis.lpush('tasks', str, function(err, res) {
            if(err) throw err;
            console.log(res);
        });
    }
});

var worker = async(function(){
    var action;
    var task = await( redis.brpop.bind(redis, 'tasks', 5) );

    if(task) {
        task = task[1].trim();

        if(typeof JSON.parse(task) == 'object') {
            action = JSON.parse(task).action;
            console.log(action);
            data = JSON.parse(task);
        }
        if(typeof JSON.parse(task) == 'string') {
            action =  JSON.parse(task);
        }

        if(typeof tik_tak_toe[action] === 'function') {
            tik_tak_toe[action](data);
            data.sockets = [];
        }
    }

    worker();
    return task;
});
worker();