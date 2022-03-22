var infraRED = (function() {
    function init() {
        console.log("InfraRED is starting.");
        infraRED.components.init();

        let component1 = {
            id: 1,
            type: "tosca.nodes.Compute"
        };

        let component2 = {
            id: 2,
            type: "tosca.nodes.Database"
        };

        let relationship1 = {
            id: 1,
            type: "tosca.relationships.HostedOn"
        };

        infraRED.components.add(component1);
        infraRED.components.add(component2);

        infraRED.components.addInput(component2, relationship1);
        infraRED.components.addOutput(component1, relationship1);

        console.log("InfraRED finished starting.");

        console.log(infraRED.components.get(1));
        console.log(infraRED.components.get(2));
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

        console.log("Emitting: " + eventName);
        
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

infraRED.components = (function() {
    // information about types of components
    registry = (function() {
        let componentTypes = [];

        function addComponentType(component) {
            componentTypes.push(component.type);
        }

        return {
            addType: addComponentType,  
        };
    })();
    
    allComponentsList = (function() {
        let components = {};

        function addComponent(component) {
            registry.addType(component);
            components[component.id] = component;
        }

        function getComponentByID(id) {
            return components[id];
        }

        return {
          addComponent: addComponent,
          getComponentByID: getComponentByID,
        };
    })();

    function addComponent(component) {
        allComponentsList.addComponent(component);
        infraRED.events.emit("components:add", component);
    }

    function relationshipExists(relationship) {
        return infraRED.components.relationships.has(relationship);
    }

    function addComponentInput(component, relationship) {
        if (!relationshipExists(relationship)) infraRED.components.relationships.add(relationship);
        allComponentsList.getComponentByID(component.id).in = relationship;
    }

    function addComponentOutput(component, relationship) {
        if (!relationshipExists(relationship)) infraRED.components.relationships.add(relationship);
        allComponentsList.getComponentByID(component.id).out = relationship;
    }

    function getComponent(componentID) {
        return allComponentsList.getComponentByID(componentID);
    }

    return {
        init: function() {
            console.log("Starting the components functionality.");
            infraRED.components.relationships.init();
        },
        add: addComponent,
        get: getComponent,
        addInput: addComponentInput,
        addOutput: addComponentOutput,
    };
})();

infraRED.components.relationships = (function() {
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