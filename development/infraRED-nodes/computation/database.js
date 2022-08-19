module.exports = function() {
    function Database() {
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
        };

        this.deploy = async function() {
            console.log('-Databasing.');
            await new Promise(r => setTimeout(r, 3000));
            console.log('-Finished Databasing.');
        };

        this.clean = async function() {
            console.log('-Shutting down.');
            await new Promise(r => setTimeout(r, 1000));
            console.log('-Cleaning myself.');
        };
    }

    return {
        create: function() {
            return new Database();
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