module.exports = function() {
    function Compute() {
        this.category = {
            name: 'Computation',
            img: 'icons\\arrow-svgrepo-com.svg',
        };

        //outline what properties this node has
        this.properties = {
            ip: '192.168.1.2',
            port: '6789',
        };
    
        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
            storage: {},
            database: {},
        };

        this.deploy = async function() {
            console.log('-Computing.');
            await new Promise(r => setTimeout(r, 1500));
            console.log('-Finished Computing.');
            await new Promise(r => setTimeout(r, 500));
        };

        this.clean = async function() {
            console.log('-Shutting down.');
            await new Promise(r => setTimeout(r, 1500));
            console.log('-Cleaning myself.');
            await new Promise(r => setTimeout(r, 500));
        };
    }

    return {
        create: function() {
            return new Compute();
        },
        load: async function() {
            //TEST - instant load
        },
    };
}();