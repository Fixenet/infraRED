class Compute {
    constructor() {
        this.capabilities = {
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
            console.log("Started.");
        },
        self: function() {
            return compute;
        }
    };
}();