module.exports = function() {
    function Storage() {
        this.category = {
            name: 'Computation',
            img: 'icons\\arrow-svgrepo-com.svg',
        };

        //outline what properties this node has
        this.properties = {
            name: '',
        };
    
        this.capabilities = {
            storage: {
                mount_point: null,
            },
        };
            
        this.requirements = {
        };

        this.deploy = async function() {
            console.log('-Building Storage space.');
            await new Promise(r => setTimeout(r, 3000));
            console.log(`-Storage available at ${this.capabilities.storage.mount_point}.`);
        };

        this.clean = async function() {
            console.log('-Closing mount point down.');
            await new Promise(r => setTimeout(r, 2000));
            this.capabilities.storage.mount_point = null;
            console.log('-Shutting down and cleaning myself.');
        };
    }

    return {
        create: function() {
            return new Storage();
        },
        load: async function() {
            //TEST - takes 2 seconds to load
            //await new Promise(r => setTimeout(r, 1000));
            if (Date.now() % 11 == 0) { //TEST - rng to throw an error
                throw new Error(`It broke, throwing an error.`);
            }
            //await new Promise(r => setTimeout(r, 1000));
        },
    };
}();