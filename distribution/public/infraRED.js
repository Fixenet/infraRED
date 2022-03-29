var infraRED = (function() {
    function init() {
        console.log("infraRED is starting.");

        infraRED.validator.init();

        infraRED.nodes.init();
        infraRED.relationships.init();

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
        constructor(type) {
            this.id = currentID++;
            this.name = "null";
            
            this.type = type;
            this.properties = {};

            this.capabilities = {};
            this.requirements = {};
        }

        changeName(name) {
            if (infraRED.validator.validateNodeType(name)) {
                this.name = name;
            } else {
                console.log("Incorrect Node name was given.");
            }
        }

        addCapabilities(cap) {
            cap.forEach((capability) => {
                this.capabilities[capability] = {};
            });
        }

        addRequirements(req) {
            req.forEach((requirement) => {
                this.requirements[requirement] = {};
            });
        }

        /**
         * Creates a div representative of the node
         * @returns {string} a div element
         */
        getDiv() {
            let div = document.createElement("div");
            div.className = "node resource-node";
            div.id = this.type;

            div.innerHTML += `<p class="type">${node.type}</p>`;

            if (Object.keys(this.requirements).length) {
                let requirements = document.createElement("div");
                requirements.className = "requirements";
                for (const requirement of Object.keys(this.requirements)) {
                    requirements.innerHTML += `<p class="requirement">${requirement}</p>`;
                }
                if (Object.keys(this.capabilities).length && Object.keys(this.requirements).length) {
                    $(requirements).css("border-bottom", "2px dashed black");
                }
                div.append(requirements);
            }
            
            if (Object.keys(this.capabilities).length) {
                let capabilities = document.createElement("div");
                capabilities.className = "capabilities";
                for (const capability of Object.keys(this.capabilities)) {
                    capabilities.innerHTML += `<p class="capability">${capability}</p>`;
                }
                div.append(capabilities);
            }

            

            return div;
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

    resourceNodesList = (function() {
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
          add: addNode,
          getByID: getNodeByID,
          getByName: getNodeByName,
          getAll: getNodeList,
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
          add: addNode,
          getByID: getNodeByID,
          getByName: getNodeByName,
          getAll: getNodeList,
        };
    })();

    function addNodeToResourceList(node) {
        resourceNodesList.add(node);
        infraRED.events.emit("nodes:add", node);
    }

    return {
        init: function() {
            console.log("Starting the nodes functionality.");
        },
        /**
         * Creates a node object and adds it to the resource list where all the nodes the system knowns about exist
         * @param {string} name 
         * @returns {Node} the created node
         */
        create: function(name) {
            let node = new Node(name);
            addNodeToResourceList(node);
            return node;
        },

        /**
         * Gets a node object from the resource list via its ID or its name
         * @param {number | string} query 
         * @returns {Node} the corresponding node
         */
        get: function(query) {
            if (typeof(query) === 'number') return resourceNodesList.getByID(query);
            else if (typeof(query) === 'string') return resourceNodesList.getByName(query);
        },

        /**
         * Checks if a node object exists in the resource list via its ID or its name
         * @param {number | string} query 
         * @returns {boolean} whether node exists or not
         */
        has: function(query) {
            return this.get(query) !== undefined;
        },

        resourceList: resourceNodesList,
        canvasList: canvasNodesList,
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
infraRED.init();

//load known nodes from a JSON file into an object variable
var nodeTypes;
$.ajax({
    url: '/nodes.json',
    dataType: 'json',
    async: false,
    success: function(data) {
        console.log("Importing node types...");
        nodeTypes = data;
    }
});

// use this file to define the base layout for the editor
$("#infraRED-ui-root").append('<div id="infraRED-ui-menu-bar">Menu</div>');

$("#infraRED-ui-root").append('<div id="infraRED-ui-category-bar">Category</div>');

$("#infraRED-ui-root").append('<div id="infraRED-ui-resource-bar">Resource</div>');

$("#infraRED-ui-root").append('<div id="infraRED-ui-canvas">Canvas</div>');

$("#infraRED-ui-root").append('<div id="infraRED-ui-status-bar">Status</div>');

let canvas = $("#infraRED-ui-canvas");
// use this file to define the category bar
// use this file to define the resource bar

//TODO - this only gets the keys, i need a way to decompose the object of each type
for (let type in nodeTypes) {
    var node = infraRED.nodes.create(type);
    
    const capabilities = nodeTypes[type].capabilities;
    const requirements = nodeTypes[type].requirements;

    if (capabilities) node.addCapabilities(nodeTypes[type].capabilities);
    if (requirements) node.addRequirements(nodeTypes[type].requirements);

    $('#infraRED-ui-resource-bar').append(node.getDiv());

    console.log("Imported: " + type);
}

$(".resource-node").draggable({
    helper: "clone",
    start: function(event, ui) {
    }
});


// use this file to define the canvas bar
canvas.droppable({
    tolerance: "fit",
    hoverClass: "drop-hover",
    accept: ".resource-node",
    drop: function(event, ui) {
        let droppedNode = $(ui.helper).clone();

        //let the editor know the node in question changed sides
        droppedNode.removeClass("resource-node");
        droppedNode.addClass("canvas-node");

        droppedNode.draggable({
            containment: "parent",
        });
        
        droppedNode.dblclick(() => {
            droppedNode.remove();
        });

        $(this).append(droppedNode);
    },
});
// use this file to define node behaviour