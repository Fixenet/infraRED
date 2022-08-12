module.exports = function() {
    function Compute() {
        this.category = {
            name: "Computation",
            img: "icons\\arrow-svgrepo-com.svg",
        };
    
        this.capabilities = {
            database: {},
        };
            
        this.requirements = {
            storage: {},
            database: {},
        };
    }

    return {
        load: async function() {
            //TEST - instant load
        },
        create: function() {
            return new Compute();
        },
        deploy: function() {

        },
    };
}();