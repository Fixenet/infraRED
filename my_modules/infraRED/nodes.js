infraRED.nodes = (function() {
    // information about types of components
    registry = (function() {
        let nodeTypes = [];

        function addNodeType(node) {
            nodeTypes.push(node.type);
        }

        return {
            addType: addNodeType,  
        };
    })();
    
    allNodesList = (function() {
        let nodes = {};

        function addNode(node) {
            registry.addType(node);
            nodes[node.id] = node;
        }

        function getNodeByID(id) {
            return nodes[id];
        }

        return {
          addNode: addNode,
          getNodeByID: getNodeByID,
        };
    })();

    function addNode(node) {
        allNodesList.addNode(node);
        infraRED.events.emit("components:add", node);
    }

    function relationshipExists(relationship) {
        return infraRED.nodes.relationships.has(relationship);
    }

    function addNodeInput(node, relationship) {
        if (!relationshipExists(relationship)) infraRED.nodes.relationships.add(relationship);
        allNodesList.getNodeByID(node.id).requirement = relationship;
    }

    function addNodeOutput(node, relationship) {
        if (!relationshipExists(relationship)) infraRED.nodes.relationships.add(relationship);
        allNodesList.getNodeByID(node.id).capability = relationship;
    }

    function getNode(nodeID) {
        return allNodesList.getNodeByID(nodeID);
    }

    return {
        init: function() {
            console.log("Starting the components functionality.");
            infraRED.nodes.relationships.init();
        },
        add: addNode,
        get: getNode,
        addInput: addNodeInput,
        addOutput: addNodeOutput,
    };
})();