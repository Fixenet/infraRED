var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");
        infraRED.nodes.init();

        let node1 = {
            id: 1,
            type: "tosca.nodes.Compute",
            
            properties: null,

            capabilities: null,
            requirements: null,
        };

        let node2 = {
            id: 2,
            type: "tosca.nodes.DBMS.MySQL",

            properties: null,

            capabilities: null,
            requirements: null,
        };

        let relationship1 = {
            id: 1,
            type: "tosca.relationships.HostedOn"
        };

        infraRED.events.DEBUG = false;
        infraRED.events.on("components:add", (node1) => {
            console.log("Added the component with id: " + node1.id);
        });

        infraRED.nodes.add(node1);
        infraRED.nodes.add(node2);

        infraRED.nodes.addInput(node2, relationship1);
        infraRED.nodes.addOutput(node1, relationship1);

        console.log("InfraRED finished starting.");

        console.log(infraRED.nodes.get(1));
        console.log(infraRED.nodes.get(2));
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

infraRED.nodes.relationships = (function() {
    registry = (function() {
        let relationshipTypes = [];

        /**
         * Adds the relationship type to the registry
         * @param {Relationship} relationship 
         */
        function addRelationshipType(relationship) {
            relationshipTypes.push(relationship.type);
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

        return {
          addRelationship: addRelationship,
          getRelationshipByID: getRelationshipByID,
          has: function(relationship) {
              relationships.hasOwnProperty(relationship);
          }
        };
    })();

    function addRelationship(relationship) {
        allRelationshipsList.addRelationship(relationship);
        infraRED.events.emit("relationships:add", relationship);
        return relationship;
    }

    function relationshipExists(relationship) {
        console.log("Checking if exists: " + JSON.stringify(relationship));
        return allRelationshipsList.has(relationship);
    }
    
    return {
        init: function() {
            console.log("Starting the relationships functionality.");
        },

        add: addRelationship,
        has: relationshipExists,
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