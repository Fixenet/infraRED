module.exports = function() {
    class Database {
        constructor() {
            this.capabilties = {

            };
                
            this.requirements = {

            };
        }

        start() {
            console.log("Started the database node!");
        }
    
        stop() {
            console.log("Stopped the database node!");
        }
    }

    return {
        init: function() {
            let database = new Database();
            database.start();
            database.stop();
        },
    };
};