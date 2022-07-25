module.exports = function() {
    class Calculator {
        constructor() {
            this.capabilties = {

            };
                
            this.requirements = {

            };
        }

        start() {
            console.log("Started the compute node!");
        }
    
        stop() {
            console.log("Stopped the compute node!");
        }
    }

    return {
        init: function() {
            let calculator = new Calculator();
            calculator.start();
            calculator.stop();
        },
    };
};