module.exports = function() {
    function Compute() {
        this.category = {
            name: 'Computation',
            img: 'icons\\arrow-svgrepo-com.svg',
        };
    
        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
            storage: {},
            database: {},
        };

        this.deploy = async function() {
            console.log('Computing.');
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