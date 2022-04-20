infraRED.canvas = (function() {
    //TODO - this infraRED element should be in charge of managing nodes and relationships together
    function createConnection(capability, requirement) {
        //TODO - do stuff with relationships
    }

    function setUpEvents() {
        infraRED.events.on("canvas:create-connection", createConnection);
    }

    return {
        init: function() {
            console.log("%cStarting the canvas functionality.", "color: #ffc895;");
            setUpEvents();
        },
    };
})();