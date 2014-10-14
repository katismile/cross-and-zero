var ConsoleRender = require('./console_render');
var renderer = new ConsoleRender();
var requestHandler = {
    'finish message': function (opt) {
        renderer.renderTable(opt.message.field);
        renderer.renderMessage(opt.message.message);
        var newGame = {
            type: 'new game'
        };
        opt.client.write(JSON.stringify(newGame));
    },
    'choose position': function (opt) {
        if (opt.message.field) {
            renderer.renderTable(opt.message.field);
        }
        opt.makeChoice(opt.message.id, opt.message.combinations, opt.client);
    },
    'opponent exit': function (opt) {
        renderer.renderMessage(opt.message.message);
    },
    'ping': function (opt) {
        var pingMessage = {
            type: 'ping'
        };
        opt.client.write(JSON.stringify(pingMessage));
    },
    'choose suit': function (opt) {
        opt.chooseSuit(opt.message, opt.client);
    }
};
module.exports = requestHandler;