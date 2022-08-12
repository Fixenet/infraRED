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
    }
    return {
        load: async function() {
            //TEST - demonstrate a bigger load time for this node
            //await new Promise(r => setTimeout(r, 2000));
            console.log('Loaded '+ moment().format('MMMM Do YYYY, h:mm:ss a'));
        },
        create: function() {
            return new NodeTemplate();
        },
        deploy: function() {

        },
    };
}();