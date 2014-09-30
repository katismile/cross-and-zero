module.exports = function (id, combinations, field, socketsName, sockets) {
    this.id = id;
    this.combinations = combinations;
    this.field = field;
    this.current = 0;
    this.socketsName = socketsName;
    this.sockets = sockets;
};