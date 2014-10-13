module.exports = function (socket, scope){
    (function restart () {
        if(scope.flag) {
            console.log(scope.suits);
            socket.write(JSON.stringify({
                type: 'choose suit',
                data: {
                    suits: scope.suits
                }
            }));
            scope.flag = false;
        }
        else{
            setTimeout (restart,500)
        }
    })()
};
