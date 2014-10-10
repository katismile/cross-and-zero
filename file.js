/**
 * Created by chegrinets on 10.10.14.
 */
//var maxNumPlayers = 3;
//
//
//function Player(name, socket) {
//    this.name = name;
//    this.socket = socket;
//    this.is_ready = false;
//    this.room = null;
//    this.figure = null;
//}
//
//function Room(name, maxPlayers) {
//    this.name = name;
//    this.maxPlayers = maxPlayers;
//    this.numPlayers = 0;
//    this.players = [];
//    this.state = 'waiting';
//}
//
//var playersList = [];
//var roomsList = [];
//
//
//Player.prototype.Reade = function() {
//    this.is_ready = true;
//};
//
//Room.prototype.wait = function() {
//    this.state = 'waiting';
//};
//Room.prototype.wait = function() {
//    this.state = 'playing';
//};
//Room.prototype.wait = function() {
//    this.state = 'finish';
//};
//Room.prototype.broadcastAll = function(message) {
//
//    for(var i = 0; i < this.players.length; i++) {
//        this.players[i].socket.write(message);
//    }
//};
//
//Room.prototype.broadcast = function(message, except) {
//
//    for(var i = 0; i < this.players.length; i++) {
//        if(this.players[i].name != except.name) {
//            this.players[i].socket.write(message);
//        }
//    }
//};
//
//function chooseRoom(player) {
//    var flag = false;
//    for(var i = 0; i < roomsList.length; i++) {
//        player:
//        for(var j = 0; j < roomsList[i].players.length; j++) {
//            if(roomsList[i].players[j].figure == player.figure && roomsList[i].numPlayers < roomsList[i].maxPlayers) {
//                flag = true;
//                continue player;
//            }
//        }
//        if(flag) {
//            roomsList[i].players.push(player);
//        }
//    }
//}