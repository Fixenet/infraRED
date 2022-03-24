var infraRED = (function() {
    function init() {
        console.log("infraRED is starting.");

        infraRED.validator.init();

        infraRED.nodes.init();
        infraRED.relationships.init();

        infraRED.nodes.create("my_server");
        infraRED.nodes.create("my_storage");

        infraRED.nodes.get("my_server").changeType("tosca.nodes.Compute");

        infraRED.nodes.addCapability(infraRED.nodes.get("my_storage"), infraRED.relationships.create("local_storage"));
        infraRED.nodes.addRequirement(infraRED.nodes.get("my_server"), infraRED.relationships.get("local_storage"));

        infraRED.nodes.addCapability(infraRED.nodes.get("my_server"), infraRED.relationships.create("host"));

        console.log(infraRED.nodes.get("my_server"));
        console.log(infraRED.nodes.get("my_storage"));

        console.log("infraRED finished booting.");
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

infraRED.validator = (function() {
    return {
        init: function() {
            console.log("Starting the validator functionality.");
        },

        //Better validation will be done to ensure proper regex rules
        validateNodeType: function(nodeType) {
            return typeof(nodeType) === 'string';
        },
        validateRelationshipType: function(relationshipType) {
            return typeof(relationshipType) === 'string';
        },
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

infraRED.relationships = (function() {
    var currentID = 1;
    class Relationship {
        constructor(name) {
            this.id = currentID++;
            this.name = name;

            this.type = null;
            this.properties = [];
        }

        changeType(typeName) {
            if (infraRED.validator.validateRelationshipType(typeName)) {
                //Add the type to the relationship object
                this.type = typeName;
                //Update the registry if needed
                if (!registry.has(typeName)) {
                    registry.addType(this);
                }
            } else {
                console.log("Incorrect Relationship Type was given.");
            }
        }
    }

    var registry = (function() {
        let relationshipTypes = [];

        function addRelationshipType(relationship) {
            // check if type is set, if not do nothing
            if (relationship.type != null) {
                relationshipTypes.push(relationship.type);
            }
        }

        function relationshipTypeExists(relationshipType) {
            return relationshipTypes.includes(relationshipType);
        }

        return {
            addType: addRelationshipType,
            has: relationshipTypeExists,
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
        };
    })();

    function addRelationship(relationship) {
        allRelationshipsList.addRelationship(relationship);
        infraRED.events.emit("relationships:add", relationship);
        return relationship;
    }
    
    return {
        init: function() {
            console.log("Starting the relationships functionality.");
        },

        add: addRelationship,
        create: function(name) {
            let relationship = new Relationship(name);
            allRelationshipsList.addRelationship(relationship); 
            return relationship;
        },
        get: function(query) {
            if (typeof query === 'number') return allRelationshipsList.getRelationshipByID(query);
            else if (typeof query === 'string') {
                return allRelationshipsList.getRelationshipByName(query);
            }
        },
        has: function(query) {
            return this.get(query) !== undefined;
        },
    };
})();

// use this file to define the base layout for the editor
$('#infraRED-ui-root').append('<div id="infraRED-ui-menu-bar">Menu</div>');
$('#infraRED-ui-root').append('<div id="infraRED-ui-category-bar">Category</div>');
$('#infraRED-ui-root').append('<div id="infraRED-ui-resource-bar">Resource</div>');

$('#infraRED-ui-root').append('<div id="infraRED-ui-canvas">Canvas</div>');
$('#infraRED-ui-canvas').droppable({
    greedy: true,
    hoverClass: "drop-hover",
    accept: ".resource-node",
    drop: function(event, ui) {
        $(this).append($(ui.helper).clone().addClass("node").removeClass("resource-node ui-draggable ui-draggable-handle ui-draggable-dragging").draggable({
            containment: "parent",
        }));
    },
});

$('#infraRED-ui-root').append('<div id="infraRED-ui-status-bar">Status</div>');

// use this file to define the category bar
const node = infraRED.nodes.create('server');
let count = 0;

$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);
$('#infraRED-ui-resource-bar').append(`<div class="resource-node" id=${node.name + (++count)}>${node.name + count}</div>`);

$(".resource-node").draggable({
    helper: "clone",
    drag: function(event, ui) {
    }
});

infraRED.init();