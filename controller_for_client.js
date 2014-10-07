module.exports = {
    ping: function(options) {
        if(options.client) {
            options.client.write(JSON.stringify('OK'));
        }
    }
};