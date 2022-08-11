const moment = require("moment");
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
        load: function() {
            console.log('Loaded '+ moment().format('MMMM Do YYYY, h:mm:ss a'));
        },
        create: function() {
            return new Database();
        },
        deploy: function() {

        },
    };
}();