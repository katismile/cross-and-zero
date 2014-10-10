var ClientController = function(client, render){
    this.client = client;
    this.render = render;
};
ClientController.prototype.finishMessage = function (message) {
    this.render.renderTable(message.field);
    this.render.renderMessage(message.message);
    var newGame = {
        type: 'new game'
    };
    this.client.write(JSON.stringify(newGame));
};
ClientController.prototype.choosePosition = function (message, makeChoice) {
    if (message.field) {
        this.render.renderTable(message.field);
    }
    makeChoice(message.id, message.combinations, this.client);
};
ClientController.prototype.disconnect = function (message) {
    this.render.renderMessage(message.message);
};
ClientController.prototype.ping = function () {
    var pingMessage = {
        type: 'ping'
    };
    this.client.write(JSON.stringify(pingMessage));
};
ClientController.prototype.chooseSuit = function (message, chooseSuit) {
    chooseSuit(message, this.client);
};
module.exports = ClientController;