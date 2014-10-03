var redis = require('redis').createClient(),
    sub = require('redis').createClient(),
    tik_tak_toe = require('./tik_tak_toe'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

var data = {
  sockets: []
};

sub.subscribe('sockets');

sub.on('message', function(channel, message) {
    data.sockets.push(message);

    if(data.sockets.length == 2) {

        var obj = {
            action: 'start',
            data: data
        };

        redis.lpush('tasks', JSON.stringify(obj), function(err, res) {
            if(err) throw err;
            console.log(res);
        });
    }
});

var worker = async(function(){

    var task = await( redis.brpop.bind(redis, 'tasks', 5) );

    if(task) {
        task = task[1].trim();

        if(typeof JSON.parse(task) == 'object') {
            task = JSON.parse(task);

            var action = task.action,
                data = task.data;
            console.log(action);
        }

        if(typeof tik_tak_toe[action] === 'function') {
            tik_tak_toe[action](data);

            if(action == 'start') {
                data.sockets = [];
            }
        }
    }

    worker();
    return task;
});
worker();