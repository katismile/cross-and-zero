var redis = require('redis').createClient();
var async = require('asyncawait/async');
var await = require('asyncawait/await');
var taskHandler = require('./worker_controller');

var worker = async(function () {
    while (true) {
        var task = await(redis.brpop.bind(redis, 'tasks', 1000));
        if (task) {
            var parsed = JSON.parse(task[1]);
            taskHandler[parsed.type](parsed.data);
        }
    }
});
worker();

