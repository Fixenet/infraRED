const moment = require("moment");

class Template {
    constructor() {
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

module.exports = function() {
    let template = new Template();

    return {
        init: function() {
            template.start();
            template.method();
            template.stop();

            console.log('Started ' + moment().format('MMMM Do YYYY, h:mm:ss a'));
        },
        self: function() {
            return template;
        }
    };
}();