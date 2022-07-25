module.exports = function() {
    class Template {
        constructor() {
            this.capabilties = {
                template: "template",
            };
                
            this.requirements = {
                template: "template",
            };
        }

        start() {
            console.log("Started the template node!");
        }
    
        stop() {
            console.log("Stopped the template node!");
        }

        method() {
            console.log("I am a template method.");
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