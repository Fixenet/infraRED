const moment = require("moment");
module.exports = function() {
    function NodeTemplate() {
        this.category = {
            name: "Example",
            img: "icons\\computer-svgrepo-com.svg",
        };
    
        this.capabilities = {
            output: {},
            output1: {},
            output2: {},
        };
            
        this.requirements = {
            input: {},
            input1: {},
            input2: {},
        };

        return this;
    }
    return {
        init: function() {
            console.log('Started ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        },
        self: function() {
            return NodeTemplate();
        },
    };
}();