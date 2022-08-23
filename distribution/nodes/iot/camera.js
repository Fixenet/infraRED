module.exports = function() {
    function Camera() {
        //data of what goes on the category bar
        this.category = {
            name: 'Internet of Things',
            img: 'icons\\arrow-svgrepo-com.svg',
        };

        this.properties = {
            //outline what properties this node has
            scheduleFrom: "10AM",
            scheduleTo: "8PM", 
        };
    
        //outline what capabilites this node has
        this.capabilities = {
            output: {
                outputStream: null,
            }
        };
        
        //outline what requirements this node has
        this.requirements = {
        };

        //method to call when creating an instance
        this.deploy = async function() {

        };

        //method to call when the instance is destroyed
        this.clean = async function() {
            console.log('-Cleaning myself.');
            await new Promise(r => setTimeout(r, 1000));
        };
    }
    return {
        //this should create an instance of the node, a separate entity that's individual
        create: function() {
            return new Camera();
        },
        //the load method should have all the necessary setup that instancing this particular node requires
        load: async function() {
            //TEST - demonstrate a bigger load time for this node
            //await new Promise(r => setTimeout(r, 2000));
        },
    };
}();