module.exports = function() {
    function Database() {
        this.category = {
            name: 'Computation',
            img: 'icons\\arrow-svgrepo-com.svg',
        };
    
        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
        };

        this.deploy = async function() {
            console.log('-Databasing.');
        };

        this.clean = async function() {
            console.log('-Closing Database connection.');
            console.log('-Cleaning myself.');
        };
    }

    return {
        create: function() {
            return new Database();
        },
        load: async function() {
            //TEST - takes 2 seconds to load
            await new Promise(r => setTimeout(r, 1000));
            if (Date.now() % 33 == 0) { //TEST - rng to throw an error
                throw new Error(`It broke, throwing an error.`);
            }
            await new Promise(r => setTimeout(r, 1000));
        },
    };
}();