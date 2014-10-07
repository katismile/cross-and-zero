var redis = require('redis').createClient(),
    tik_tak_toe = require('./tik_tak_toe'),
    async = require('asyncawait/async'),
    await = require('asyncawait/await');

var worker = async(function(){

    var task = await( redis.brpop.bind(redis, 'tasks', 5) );

    if(task) {
        task = task[1].trim();

        if(typeof JSON.parse(task) == 'object') {
            task = JSON.parse(task);

            var action = task.action,
                data = task.data;
        }

        if(typeof tik_tak_toe[action] === 'function') {
            tik_tak_toe[action](data);
        }
    }

    worker();
    return task;
});
worker();