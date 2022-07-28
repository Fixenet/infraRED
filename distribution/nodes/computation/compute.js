class Compute {
    constructor() {
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
}

module.exports = function() {
    let compute = new Compute();
    return {
        init: function() {
            console.log('Started.');
        },
        self: function() {
            return compute;
        }
    };
}();