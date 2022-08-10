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

        return this;
    }

    return {
        init: function() {
            console.log('Started.');
        },
        self: function() {
            return Compute();
        },
    };
}();