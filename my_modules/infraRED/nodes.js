infraRED.nodes = (function() {
    var currentID = 1;
    class Node {
        constructor(name) {
            this.id = currentID++;
            this.name = name;
            
            this.type = null;
            this.properties = [];

            this.capabilities = [];
            this.requirements = [];
        }
    }

    // information about types of nodes
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

        function getNodeByName(name) {
            for (let id in nodes) {
                if (nodes[id].name === name) {
                    return nodes[id];
                }
            }
        }

        function getNodeList() {
            return nodes;
        }

        return {
          addNode: addNode,
          getNodeByID: getNodeByID,
          getNodeByName: getNodeByName,
          getNodeList: getNodeList,
        };
    })();

    function addNode(node) {
        allNodesList.addNode(node);
        infraRED.events.emit("components:add", node);
    }

    function relationshipExists(relationship) {
        return infraRED.relationships.has(relationship);
    }

    function addNodeInput(node, relationship) {
        if (!relationshipExists(relationship)) infraRED.relationships.add(relationship);
        allNodesList.getNodeByID(node.id).requirements.push(relationship);
    }

    function addNodeOutput(node, relationship) {
        if (!relationshipExists(relationship)) infraRED.relationships.add(relationship);
        allNodesList.getNodeByID(node.id).capabilities.push(relationship);
    }

    return {
        init: function() {
            console.log("Starting the components functionality.");
        },
        create: function(name) {
            let node = new Node(name);
            allNodesList.addNode(node);
            return node;
        },
        get: function(query) {
            if (typeof query === 'number') return allNodesList.getNodeByID(query);
            else if (typeof query === 'string') {
                return allNodesList.getNodeByName(query);
            }
        },
        addRequirement: addNodeInput,
        addCapability: addNodeOutput,
    };
})();