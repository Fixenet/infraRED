infraRED.canvas = (function() {
    //TODO - this infraRED element should be in charge of managing nodes and relationships together
    function createConnection(capability, requirement) {
        //TODO - do stuff with relationships
    }

    function maxNodesReachedInCanvas() {
        infraRED.editor.statusBar.log("Can no longer add more Nodes to the Canvas\nPlease remove some before continuing...");
    }

    function setUpEvents() {
        infraRED.events.on("canvas:create-connection", createConnection);
        infraRED.events.on("nodes:max-nodes-in-canvas", maxNodesReachedInCanvas);
    }

    return {
        init: function() {
            console.log("%cStarting the canvas functionality.", "color: #ffc895;");
            setUpEvents();
        },
    };
})();