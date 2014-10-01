
module.exports = function controller(handle, message) {

    if(typeof message === 'object') {
        if (typeof handle[message.type] === 'function') {
            handle[message.type](message);
        }
    }
};

