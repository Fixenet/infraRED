class Database {
    constructor() {
        this.category = {
            name: "Computation",
            img: "icons\\arrow-svgrepo-com.svg",
        };

        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
        };
    }
}

module.exports = function() {
    let database = new Database();
    return {
        init: function() {
            console.log('Started.');
        },
        self: function() {
            return database;
        }
    };
}();