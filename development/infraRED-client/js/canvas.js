infraRED.canvas = (function() {
    function resetConnectionVariables() {
        return {
            capability: null,
            capabilitySVG: null,

            requirement: null,
            requirementSVG: null,

            isConnecting: false,
            typeConnecting: null,
        };
    }

    function createRelationship() {
        let relationship = infraRED.relationships.create(connectionVariables.capability, connectionVariables.requirement);
        infraRED.nodes.canvasList.getByID(connectionVariables.capability.nodeID).addRelationship(relationship);
        infraRED.nodes.canvasList.getByID(connectionVariables.requirement.nodeID).addRelationship(relationship);

        infraRED.events.emit('canvas:create-relationship-connection', connectionVariables.capabilitySVG, connectionVariables.requirementSVG);

        connectionVariables = resetConnectionVariables();
    }

    let connectionVariables = resetConnectionVariables();
    function createConnection(connectable, connectableSVG) {
        if (connectionVariables.isConnecting) { // we already made the first selection and now are trying to make a connection
            if (connectionVariables.typeConnecting != connectable.type) {
                throw 'Cannot connect capabilities/requirements of different types...';
            }
            //TODO
            //if (connectionVariables.capability.nodeID == connectable.nodeID || connectionVariables.requirement.nodeID == connectable.nodeID) {
            //    throw 'Cannot connect capabilities/requirements of the same node...';
            //}
            if (connectable.mode === 'capability' && connectionVariables.capability == null) {
                connectionVariables.capability = connectable;
                connectionVariables.capabilitySVG = connectableSVG;
            } else if (connectable.mode === 'requirement' && connectionVariables.requirement == null) {
                connectionVariables.requirement = connectable;
                connectionVariables.requirementSVG = connectableSVG;
            } else {
                throw 'Please connect a capability and a requirement together...';
            }

            createRelationship();
        } else { // we haven't chosen the first selection to start connecting
            if (connectionVariables.capability == null && connectionVariables.requirement == null) { // make sure
                if (connectable.mode === 'capability') {
                    connectionVariables.capability = connectable;
                    connectionVariables.capabilitySVG = connectableSVG;
                } else if (connectable.mode === 'requirement') {
                    connectionVariables.requirement = connectable;
                    connectionVariables.requirementSVG = connectableSVG;
                }
                connectionVariables.isConnecting = true;
                connectionVariables.typeConnecting = connectable.type;
                connectableSVG.addClass('selected-connectable');
                infraRED.events.emit('canvas:create-relationship-preview-line', connectableSVG);
            }
        }
    }

    function resetConnection() {
        if(connectionVariables.capability) connectionVariables.capabilitySVG.removeClass('selected-connectable');
        if(connectionVariables.requirement) connectionVariables.requirementSVG.removeClass('selected-connectable');

        connectionVariables = resetConnectionVariables();
    }

    function maxNodesReachedInCanvas() {
        infraRED.editor.statusBar.log('Can no longer add more Nodes to the Canvas\nPlease remove some before continuing...');
    }

    function logConnectionVariables() {
        console.log(connectionVariables);
    }

    return {
        init: function() {
            console.log('%cStarting the canvas functionality.', 'color: #ffc895;');

            infraRED.events.on('canvas:log-connection-variables', logConnectionVariables);
            infraRED.events.on('canvas:create-connection', createConnection);
            infraRED.events.on('canvas:reset-connection', resetConnection);
            infraRED.events.on('nodes:max-nodes-in-canvas', maxNodesReachedInCanvas);
        },
    };
})();