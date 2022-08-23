module.exports = function() {
    function Example() {
        //data of what goes on the category bar
        this.category = {
            name: 'Example',
            img: 'icons\\important.png',
        };

        this.properties = {
            //outline what properties this node has
            ip: '192.168.1.2',
        };
    
        //outline what capabilites this node has
        this.capabilities = {
            example1: { 
                port1: 1111,
                port2: 2222,
                port3: 3333,
            },
            example2: { 
                port: '1112',
            },
            example3: {
                port: '1113',
            },
        };
        
        //outline what requirements this node has
        this.requirements = {
            example1: { 
                port1: '11',
                port2: '22',
            },
            example2: { 
                port: '12',
            },
            example3: { 
                port: '13',
            },
        };

        //method to call when creating an instance
        this.deploy = async function() {
            console.log('-Doing some stuff.');
            await new Promise(r => setTimeout(r, 2000));
            console.log('-Doing some more other stuff.');
            await new Promise(r => setTimeout(r, 1000));
            console.log('-Finished doing stuff.');

            console.log(this.properties.name, this.properties.ip, this.capabilities);
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
            //await new Promise(r => setTimeout(r, 2000));
        },
    };
}();