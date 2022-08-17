module.exports = function() {
    function Example() {
        //data of what goes on the category bar
        this.category = {
            name: 'Example',
            img: 'icons\\computer-svgrepo-com.svg',
        };
    
        //outline what capabilites this node has
        this.capabilities = {
            output: {},
            output1: {},
            output2: {},
        };
        
        //outline what requirements this node has
        this.requirements = {
            input: {},
            input1: {},
            input2: {},
        };

        //method to call when creating an instance
        this.deploy = async function() {
            console.log('-Doing some stuff.');
            await new Promise(r => setTimeout(r, 2000));
            console.log('-Doing some more other stuff.');
            await new Promise(r => setTimeout(r, 1000));
            console.log('-Finished doing stuff.');
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
            return new Example();
        },
        //the load method should have all the necessary setup that instancing this particular node requires
        load: async function() {
            //TEST - demonstrate a bigger load time for this node
            await new Promise(r => setTimeout(r, 2000));
        },
    };
}();