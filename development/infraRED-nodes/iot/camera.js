module.exports = function() {
    class Camera {
        constructor() {
            this.capabilties = {

            };
                
            this.requirements = {

            };
        }

        start() {
            console.log("Started the camera node!");
        }
    
        stop() {
            console.log("Stopped the camera node!");
        }
    }

    return {
        init: function() {
            let camera = new Camera();
            camera.start();
            camera.stop();
        },
    };
};