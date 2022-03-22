var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");

        infraRED.nodes.init();
        infraRED.relationships.init();

        infraRED.nodes.create("my_server");
        infraRED.nodes.create("my_storage");

        infraRED.nodes.addCapability(infraRED.nodes.get(2), infraRED.relationships.create("local_storage"));
        infraRED.nodes.addRequirement(infraRED.nodes.get(1), infraRED.relationships.get("local_storage"));

        infraRED.nodes.addCapability(infraRED.nodes.get(1), infraRED.relationships.create("host"));

        console.log("InfraRED finished booting.");
    }

    return {
        init: init,
    };
})();

infraRED.events = (function() {
    var handlers = {};

    function on(eventName, handlerFunction) {
        handlers[eventName] = handlers[eventName] ? handlers[eventName] : [];
        handlers[eventName].push(handlerFunction);
    }

    function off(eventName, handlerFunction) {
        var handler = handlers[eventName];
        if (handler) {
            for (let i = 0; i < handler.length; i++) {
                if (handler[i] === handlerFunction) {
                    handler.splice(i,1);
                    return;
                }
            }
        }
    }

    function emit() {
        var eventName = arguments[0];
        var args = Array.prototype.slice.call(arguments, 1);

        if (infraRED.events.DEBUG) console.log("Emitting event called: " + eventName);
        
        if (handlers[eventName]) {
            for (let i = 0; i < handlers[eventName].length; i++) {
                try {
                    handlers[eventName][i].apply(null, args);
                } catch(err) {
                    console.warn("infraRED.events.emit error: ["+eventName+"] " + (err.toString()));
                    console.warn(err);
                }
            }
        }
    }

    return {
        on: on,
        off: off,
        emit: emit,
    };
})();

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

infraRED.relationships = (function() {
    var currentID = 1;
    class Relationship {
        constructor(name) {
            this.id = currentID++;
            this.name = name;

            this.type = null;
            this.properties = [];
        }
    }

    registry = (function() {
        let relationshipTypes = [];

        function addRelationshipType(relationship) {
            // check if type is set, if not do nothing
            if (relationship.type) {
                relationshipTypes.push(relationship.type);
            }
        }

        return {
            addType: addRelationshipType,  
        };
    })();

    allRelationshipsList = (function() {
        let relationships = {};

        function addRelationship(relationship) {
            registry.addType(relationship);
            relationships[relationship.id] = relationship;
        }

        function getRelationshipByID(id) {
            return relationships[id];
        }

        function getRelationshipByName(name) {
            for (let id in relationships) {
                if (relationships[id].name === name) {
                    return relationships[id];
                }
            }
        }

        function getRelationshipList() {
            return relationships;
        }

        return {
          addRelationship: addRelationship,
          getRelationshipByID: getRelationshipByID,
          getRelationshipByName: getRelationshipByName,
          getRelationshipList: getRelationshipList,
          has: function(relationship) {
              relationships.hasOwnProperty(relationship);
          },
        };
    })();

    function addRelationship(relationship) {
        allRelationshipsList.addRelationship(relationship);
        infraRED.events.emit("relationships:add", relationship);
        return relationship;
    }

    function relationshipExists(relationship) {
        return allRelationshipsList.has(relationship);
    }
    
    return {
        init: function() {
            console.log("Starting the relationships functionality.");
        },

        add: addRelationship,
        has: relationshipExists,
        get: function(query) {
            if (typeof query === 'number') return allRelationshipsList.getRelationshipByID(query);
            else if (typeof query === 'string') {
                return allRelationshipsList.getRelationshipByName(query);
            }
        },
        create: function(name) {
            let relationship = new Relationship(name);
            allRelationshipsList.addRelationship(relationship); 
            return relationship;
        }
    };
})();

parsedDesign = {
    tosca_definitions_version: "tosca_simple_yaml_1_3tosca_simple_yaml_1_3",
    description: "Template for deploying a two-tier application on two servers.",
    topology_template: {
        node_templates: {
            "db_server": {
                type: "tosca.nodes.Compute",
                capabilities: {
                    "host": {
                        properties: {
                            "num_cpus": 1,
                            "disk_size": "10 GB",
                            "mem_size": "4096 MB"
                        }
                    },
                    "os": {
                        properties: {
                            "architecture": "x86_64",
                            "type": "linux",
                            "distribution": "rhel", 
                            "version": "6.5" 
                        }
                    }
                }
            }
        },
        relationship_templates: {
            "wp_db_connection": {
                type: "ConnectsTo",
                interfaces: {
                    "Configure": {
                        "pre_configure_source": "scripts/wp_db_configure.sh"
                    }
                }
            }
        }
    }
};
  
infraRED.init();