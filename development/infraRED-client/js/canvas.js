infraRED.canvas = (function() {
    function resetConnectionVariables() {
        return {
            capability: null,
            capabilitySVG: null,

            requirement: null,
            requirementSVG: null,

            isConnecting: false,
        };
    }

    let connectionVariables = resetConnectionVariables();

    //TODO - this infraRED element should be in charge of managing nodes and relationships together
    function createConnection(connectable, connectableSVG) {
        if (connectionVariables.isConnecting) { // we already made the first selection and now are trying to make a connection
            if (connectionVariables.capability == connectable.node || connectionVariables.requirement == connectable.node) {
                console.log("Cannot connect capabilities/requirements of the same node...");
                return;
            }

            if (connectable.mode === "capability" && connectionVariables.capability == null) {
                connectionVariables.capability = connectable;
                connectionVariables.capabilitySVG = connectableSVG;
            } else if (connectable.mode === "requirement" && connectionVariables.requirement == null) {
                connectionVariables.requirement = connectable;
                connectionVariables.requirementSVG = connectableSVG;
            } else {
                console.log("Please connect a capability and a requirement together.");
            }
            
            let relationship = infraRED.relationships.create(connectionVariables.capability, connectionVariables.requirement);
            connectionVariables.capability.node.addRelationship(relationship);
            connectionVariables.requirement.node.addRelationship(relationship);

            infraRED.events.emit("canvas:draw-connection", connectionVariables.capabilitySVG, connectionVariables.requirementSVG);

            connectionVariables = resetConnectionVariables();
        } else { // we haven't chosen the first selection to start connecting
            if (connectionVariables.capability == null && connectionVariables.requirement == null) { // make sure
                if (connectable.mode === "capability") {
                    connectionVariables.capability = connectable;
                    connectionVariables.capabilitySVG = connectableSVG;
                } else if (connectable.mode === "requirement") {
                    connectionVariables.requirement = connectable;
                    connectionVariables.requirementSVG = connectableSVG;
                }
                connectionVariables.isConnecting = true;
                connectableSVG.addClass("selected-connectable");
                infraRED.events.emit("canvas:start-draw-preview-line", connectableSVG);
            }
        }
    }

    function resetConnection() {
        if(connectionVariables.capability) connectionVariables.capabilitySVG.removeClass("selected-connectable");
        if(connectionVariables.requirement) connectionVariables.requirementSVG.removeClass("selected-connectable");

        connectionVariables = resetConnectionVariables();
    }

    function maxNodesReachedInCanvas() {
        infraRED.editor.statusBar.log("Can no longer add more Nodes to the Canvas\nPlease remove some before continuing...");
    }

    function setUpEvents() {
        infraRED.events.on("canvas:create-connection", createConnection);
        infraRED.events.on("canvas:reset-connection", resetConnection);
        infraRED.events.on("nodes:max-nodes-in-canvas", maxNodesReachedInCanvas);
    }

    return {
        init: function() {
            console.log("%cStarting the canvas functionality.", "color: #ffc895;");
            setUpEvents();
        },
    };
})();