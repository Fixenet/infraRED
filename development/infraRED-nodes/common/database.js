module.exports = function() {
    class Database {
        constructor() {
            this.capabilties = {
                hello: {},
                goodbye: {},
                testing: "Hello!",
            };
                
            this.requirements = {
            };
        }

        start() {
            return "Started the database node!";
        }
        
        stop() {
            return "Stopped the database node!";
        }
    }
    
    let data = new Database();
    console.log(data.start());
    console.log(data.capabilties);
};