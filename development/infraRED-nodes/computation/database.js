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

        return this;
    }

    return {
        init: function() {
            console.log('Started.');
        },
        self: function() {
            return Database();
        },
    };
}();