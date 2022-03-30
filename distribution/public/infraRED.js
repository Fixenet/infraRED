var infraRED = (function() {
    return {
        init: function() {
            console.log("infraRED is starting.");
    
            infraRED.events.DEBUG = true;
    
            infraRED.validator.init();
    
            infraRED.nodes.init();
            infraRED.relationships.init();
    
            console.log("infraRED finished booting.");
        },
    };
})();
infraRED.events = (function() {
    var handlers = {};

    function on(eventName, handlerFunction) {
        //if the event doesn't exist create a new handler list for that event
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

            div.innerHTML += `<p class="type">${this.type}</p>`;

            if (Object.keys(this.requirements).length) {
                let requirements = document.createElement("div");
                requirements.className = "requirements";
                for (const requirement of Object.keys(this.requirements)) {
                    requirements.innerHTML += `<p class="requirement">${requirement}</p>`;
                }
                if (Object.keys(this.capabilities).length && Object.keys(this.requirements).length) {
                    $(requirements).css("border-bottom", "0.30em dashed black");
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
// use this file to define the base layout for the editor
infraRED.editor = (function() {
    return {
        init: function() {
            console.log("Creating Editor...");

            $("#infraRED-ui-root").append('<div id="infraRED-ui-menu-bar"></div>');
            infraRED.editor.menu.init();

            $("#infraRED-ui-root").append('<div id="infraRED-ui-category-bar"></div>');
            infraRED.editor.category.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-resource-bar"></div>');
            infraRED.editor.resource.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-canvas"></div>');
            infraRED.editor.canvas.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-status-bar"></div>');
            infraRED.editor.status.init();

            infraRED.editor.nodes.init();
        },
    };
})();
// use this file to define the category bar
infraRED.editor.category = (function() {
    let categoryBar;

    return {
        init: function() {
            console.log("Creating Category Bar...");

            categoryBar = $("#infraRED-ui-category-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Category";
        
            categoryBar.append(title);
        },
        get: function() {
            return categoryBar;
        },
    };
})();
// use this file to define the resource bar
infraRED.editor.resource = (function() {
    let resourceBar;

    //TODO - i may not want to have file handling behaviour on a supposed JS DOM manipulation only file
    function importNodeTypesFromJSON() {
        let nodeTypes;
        $.ajax({
            url: '/nodes.json',
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                nodeTypes = data;
                console.log("Importing node types...");
            }
        });
        return nodeTypes;
    }

    function loadNodeTypes() {
        let nodeTypes = importNodeTypesFromJSON();
        let importedNodes = [];
        for (let type in nodeTypes) {
            let node = infraRED.nodes.create(type);
            
            const capabilities = nodeTypes[type].capabilities;
            const requirements = nodeTypes[type].requirements;
        
            if (capabilities) node.addCapabilities(nodeTypes[type].capabilities);
            if (requirements) node.addRequirements(nodeTypes[type].requirements);
        
            importedNodes.push(node);
        
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    return {
        init: function() {
            console.log("Creating Resource Bar...");

            resourceBar = $("#infraRED-ui-resource-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Resource";
        
            resourceBar.append(title);

            loadNodeTypes().forEach(node => {
                resourceBar.append(node.getDiv());
            });
        },
        get: function() {
            return resourceBar;
        },
    };
})();
// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    return {
        init: function() {
            canvas = $("#infraRED-ui-canvas");

            canvas.droppable({
                tolerance: "fit",
                hoverClass: "node-hover-drop",
                accept: ".resource-node",
                drop: function(event, ui) {
                    let droppedNode = $(ui.helper).clone();
            
                    //let the editor know the node in question changed sides
                    infraRED.events.emit("node:canvas-drop", droppedNode);
            
                    $(this).append(droppedNode);
                },
            });
        
            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Canvas";
        
            canvas.append(title);
        }
    };
})();
// use this file to define the menu bar
infraRED.editor.menu = (function() {
    let menuBar;

    return {
        init: function() {
            console.log("Creating Menu Bar...");

            menuBar = $("#infraRED-ui-menu-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Menu";
        
            menuBar.append(title);
        },
        get: function() {
            return menuBar;
        },
    };
})();
// use this file to define the status bar
infraRED.editor.status = (function() {
    let statusBar;

    return {
        init: function() {
            console.log("Creating Status Bar...");

            statusBar = $("#infraRED-ui-status-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Status";
        
            statusBar.append(title);
        },
        get: function() {
            return statusBar;
        },
    };
})();
// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    return {
        init: function() {
            $(".resource-node").draggable({
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,

                create: function(event, ui) {
                    console.log("Create Drag");
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    console.log("Start Drag");
                    $(ui.helper).width();
                },
                drag: function(event, ui) {
                    console.log("Dragging");
                },
                stop: function(event, ui) {
                    console.log("Stop Drag");
                },
            });
            
            infraRED.events.on("node:canvas-drop", (droppedNode) => {
                droppedNode.removeClass("resource-node");
                droppedNode.addClass("canvas-node");
            
                droppedNode.draggable({
                    containment: "parent",
                });
                    
                droppedNode.dblclick(() => {
                    droppedNode.remove();
                });
            });
        }
    };
})();
//"backend" client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();