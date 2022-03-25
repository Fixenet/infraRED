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

        changeType(typeName) {
            if (infraRED.validator.validateNodeType(typeName)) {
                //Add the type to the node object
                this.type = typeName;
                //Update the registry if needed
                if (!registry.has(typeName)) {
                    registry.addType(this);
                }
            } else {
                console.log("Incorrect Node Type was given.");
            }
        }

        addCapability(relationship) {
            this.capabilities.push(relationship);
        }

        addRequirement(relationship) {
            this.requirements.push(relationship);
        }
    }

    // information about types of nodes
    var registry = (function() {
        let nodeTypes = [];

        function addNodeType(node) {
            // check if type is set, if not do nothing
            if (node.type != null) {
                nodeTypes.push(node.type);
            }
        }
        
        function nodeTypeExists(nodeType) {
            return nodeTypes.includes(nodeType);
        }

        return {
            addType: addNodeType,
            has: nodeTypeExists,
        };
    })();

    allNodesList = (function() {
        let nodes = {};

        function addNode(node) {
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

    canvasNodesList = (function() {
        let nodes = {};

        function addNode(node) {
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

    function addToNodeList(node) {
        allNodesList.addNode(node);
        infraRED.events.emit("nodes:add", node);
    }

    function addNodeCapability(node, relationship) {
        allNodesList.getNodeByID(node.id).addCapability(relationship);
    }

    function addNodeRequirement(node, relationship) {
        allNodesList.getNodeByID(node.id).addRequirement(relationship);
    }

    return {
        init: function() {
            console.log("Starting the nodes functionality.");
        },
        create: function(name) {
            let node = new Node(name);
            addToNodeList(node);
            return node;
        },
        get: function(query) {
            if (typeof(query) === 'number') return allNodesList.getNodeByID(query);
            else if (typeof(query) === 'string') return allNodesList.getNodeByName(query);
        },
        has: function(query) {
            return this.get(query) !== undefined;
        },
        addCapability: addNodeCapability,
        addRequirement: addNodeRequirement,
    };
})();