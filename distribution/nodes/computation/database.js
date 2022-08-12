module.exports = function() {
    function Database() {
        this.category = {
            name: "Computation",
            img: "icons\\arrow-svgrepo-com.svg",
        };
    
        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
        };
    }

    return {
        load: async function() {
            //TEST - takes 2 seconds to load
            await new Promise(r => setTimeout(r, 1000));
            if (Date.now() % 3 == 0) { //TEST - rng to throw an error
                throw new Error(`It's broken.`);
            }
            await new Promise(r => setTimeout(r, 1000));
        },
        create: function() {
            return new Database();
        },
        deploy: function() {

        },
    };
}();