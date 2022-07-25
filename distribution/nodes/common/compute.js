module.exports = function() {
    class Compute {
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
            let compute = new Compute();
            compute.start();
            compute.stop();
        },
    };
};