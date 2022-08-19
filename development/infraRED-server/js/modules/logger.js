const moment = require('moment');

class Logger {
    constructor(prefix) {
        this.prefix = prefix;
    }

    log(msg) {
        if (this.prefix === '') throw Error('No prefix given, please initialize logger with init().');
        console.log(`${this.prefix}@${moment().format('HH:mm:ss')}: ${msg}`);
    }

    newLine() {
        console.log(' ');
    }
    
    error(error) {
        console.error(error);
    }
}

module.exports = {
    init: (prefix) => {
        return new Logger(prefix);
    },
};