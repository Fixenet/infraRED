const { template } = require("grunt");

function templateMethod() {
    console.log("I am a template method.");
}

module.exports = function() {
    class Template {
        constructor() {
            this.capabilties = {
                template: "template",
            };
                
            this.requirements = {
                template: "template",
            };
        
            this.start = function() {
                console.log("Started the template node!");
            };
        
            this.stop = function() {
                console.log("Stopped the template node!");
            };

            this.method = templateMethod;
        }
    }

    return {
        init: function() {
            let template = new Template();
            template.start();
            template.method();
            template.stop();
        },
    };
};