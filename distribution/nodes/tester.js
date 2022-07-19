module.exports = function() {
    class Tester {
        constructor() {
            this.capabilties = {
                hello: {},
                goodbye: {},
                testing: "Hello!",
            };
                
            this.requirements = {
            };
        
            this.start = function() {
                console.log("Started the test node!");
            };
        
            this.stop = function() {
                console.log("Stopped the test node!");
            };
        }
    }
    
    let test = new Tester();
    console.log(test.capabilties);
};