var infraRED = (function() {
    return {
        init: function() {
            console.log("infraRED is starting.");
    
            infraRED.events.DEBUG = true;
            infraRED.validator.init();
    
            infraRED.nodes.init();
            infraRED.relationships.init();
            infraRED.canvas.init();
    
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
infraRED.settings = (function() {
    nodes = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: "No Name Node",
        };
    })();

    capabilities = (function() {
        return {
            EMPTY_NAME: "No Name Capability",
        };
    })();

    requirements = (function() {
        return {
            EMPTY_NAME: "No Name Requirement",
        };
    })();

    relationships = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: "No Name Relationship",
        };
    })();

    return {
        capabilities: capabilities,
        requirements: requirements,
        nodes: nodes,
        relationships: relationships,
    };
})();
infraRED.canvas = (function() {
    //TODO - this infraRED element should be in charge of managing nodes and relationships together
    function createConnection(capability, capabilityNode, requirement, requirementNode) {
        //TODO - do stuff with relationships
        let relationship = infraRED.relationships.create(capability, requirement);
        capabilityNode.addRelationship(relationship);
        requirementNode.addRelationship(relationship);
    }

    function maxNodesReachedInCanvas() {
        infraRED.editor.statusBar.log("Can no longer add more Nodes to the Canvas\nPlease remove some before continuing...");
    }

    function setUpEvents() {
        infraRED.events.on("canvas:create-connection", createConnection);
        infraRED.events.on("nodes:max-nodes-in-canvas", maxNodesReachedInCanvas);
    }

    return {
        init: function() {
            console.log("%cStarting the canvas functionality.", "color: #ffc895;");
            setUpEvents();
        },
    };
})();
infraRED.nodes = (function() {
    /**
     * Represents a capability of a Node, a possible functionality that can be served to another Node.
     * These have no id since the type is a unique identifier in each Node.
     */
    class Capability {
        constructor(type) {
            this.name = null;

            this.type = type;
        }

        getDiv() {
            let capability = $("<div>", {
                id: this.type,
                class: "connectable capability",
                text: this.name ? this.name : this.type,
            });

            capability.attr({
                name: this.name,
                type: this.type,
            });

            return capability;
        }
    }
    /**
     * Represents a requirement of a Node, a necessary functionality for a Node to work correctly.
     * These have no id since the type is a unique identifier in each Node.
     */
    class Requirement {
        constructor(type) {
            this.name = null;

            this.type = type;
        }

        getDiv() {
            let requirement = $("<div>", {
                id: this.type,
                class: "connectable requirement",
                text: this.name ? this.name : this.type,
            });

            requirement.attr({
                name: this.name,
                type: this.type,
            });

            return requirement;
        }
    }
    /**
     * Represents any piece of physical/virtual infrastructure.
     */
    class Node {
        constructor(type) {
            this.resourceID = null;
            this.canvasID = null;

            this.name = infraRED.settings.nodes.EMPTY_NAME;
            
            this.type = type;
            this.properties = {};

            this.capabilities = {};
            this.requirements = {};

            this.relationships = {};
        }

        setName(name) {
            if (infraRED.validator.validateNodeType(name)) {
                this.name = name;
            } else {
                console.log("Incorrect Node name was given.");
            }
        }

        addCapability(capabilityType) {
            // index by type since only one of each type exists in each Node
            let capability = new Capability(capabilityType);
            this.capabilities[capabilityType] = capability;
        }

        addRequirement(requirementType) {
            // index by type since only one of each type exists in each Node
            let requirement = new Requirement(requirementType);
            this.requirements[requirementType] = requirement;
        }

        addRelationship(relationship) {
            this.relationships[relationship.canvasID] = relationship;
        }

        getDiv() {
            let div = $("<div>", {
                id: this.resourceID,
                class: "resource node resource-node",
            });

            div.append($("<div>", { 
                class: "type", 
                text: this.type,
            }));

            if (!$.isEmptyObject(this.requirements)) {
                let requirements = $("<div>", {
                    class: "requirements",
                });

                Object.values(this.requirements).forEach(requirement => {
                    requirements.append(requirement.getDiv());
                });

                // add a border line to separate capabilities from requirements if both exist
                if (!$.isEmptyObject(this.requirements) && !$.isEmptyObject(this.capabilities)) {
                    requirements.addClass("connectable-separator");
                }

                div.append(requirements);
            }
            
            if (!$.isEmptyObject(this.capabilities)) {
                let capabilities = $("<div>", {
                    class: "capabilities",
                });

                Object.values(this.capabilities).forEach(capability => {
                    capabilities.append(capability.getDiv());
                });

                div.append(capabilities);
            }
            
            return div;
        }

        print() {
            // this node is only present in the resource bar
            let printResult = `ResourceID ${this.resourceID}: ${this.type}`;
            if (this.canvasID != null) { // this node also exists in the canvas
                printResult += `\nCanvasID ${this.canvasID}: ${this.name}`;
            }
            return printResult;
        }
    }

    let currentID = 0;
    // this list holds information about the node types loaded into infraRED
    resourceNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            node.resourceID = currentID++;
            nodeList[node.resourceID] = node;
        }

        function getNodeByIdentifier(id) {
            return nodeList[id];
        }

        // returns an array with the node class instances
        function getNodeList() {
            return Object.values(nodeList);
        }

        return {
          add: addNode,
          getByID: getNodeByIdentifier,
          getAll: getNodeList,
        };
    })();

    // this list holds information about the nodes in play
    // these nodes will be different from the nodes present in the resource bar
    // for that distinction, resource nodes will have sequential IDs
    // and canvas nodes will have the random IDs
    canvasNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            node.canvasID = createCanvasID();
            nodeList[node.canvasID] = node;
        }

        function removeNode(node) {
            delete nodeList[node.canvasID];
        }

        function getNodeByIdentifier(id) {
            return nodeList[id];
        }

        // returns an array with the node class instances
        function getNodeList() {
            return Object.values(nodeList);
        }

        return {
          add: addNode,
          remove: removeNode,
          getByID: getNodeByIdentifier,
          getAll: getNodeList,
        };
    })();

    function logResourceList() {
        console.log("Logging resources list...");
        let logString = [];

        resourceNodesList.getAll().forEach(node => {
            logString.push(node.print());
        });

        logString = logString.join("\n");
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function logCanvasList() {
        console.log("Logging canvas list...");
        let logString = [];

        canvasNodesList.getAll().forEach(node => {
            logString.push(node.print());
        });

        logString = logString.join("\n");
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function setUpEvents() {
        infraRED.events.on("nodes:log-resources", logResourceList);
        infraRED.events.on("nodes:log-canvas", logCanvasList);
    }

    function newResourceNode(type) {
        let newNode = new Node(type);
        resourceNodesList.add(newNode);
        infraRED.events.emit("nodes:add-resources", newNode);
        return newNode;
    }

    function moveNodeToCanvas(resourceNode) {
        // stop the node from entering the canvas if we are at max value
        if (canvasNodesList.getAll().length == infraRED.settings.nodes.MAX_ID) {
            infraRED.events.emit("nodes:max-nodes-in-canvas");
            //TODO - disallow any further action, this may not be correctly propagated
            return null;
        }

        let canvasNode = new Node(resourceNode.type);
        canvasNode.resourceID = resourceNode.resourceID;

        //TODO - this is an object atribution so i'm passing a reference, bad
        canvasNode.capabilities = resourceNode.capabilities;
        canvasNode.requirements = resourceNode.requirements;

        canvasNodesList.add(canvasNode);

        infraRED.events.emit("nodes:move-to-canvas", canvasNode);

        return canvasNode;
    }

    function removeNodeFromCanvas(canvasNode) {
        canvasNodesList.remove(canvasNode);
    }

    function createCanvasID() {
        function generateID() {
            return Math.floor(Math.random() * infraRED.settings.nodes.MAX_ID);
        }

        let newID = generateID();
        while (canvasNodesList.getByID(newID) != undefined) newID = generateID();

        return newID;
    }

    return {
        init: function() {
            console.log("Starting the nodes functionality.");
            setUpEvents();
        },

        new: newResourceNode,
        add: moveNodeToCanvas,
        remove: removeNodeFromCanvas,

        resourceList: resourceNodesList,
        canvasList: canvasNodesList,
    };
})();
infraRED.relationships = (function() {
    /**
     * Represents a connection between 2 Nodes via a Capability from one 
     * and a Requirement from another. 
     */
    class Relationship {
        constructor(capability, requirement) {
            this.canvasID = null;

            this.name = infraRED.settings.relationships.EMPTY_NAME;

            this.type = null;

            this.capability = capability;
            this.requirement = requirement;
        }
    }

    canvasRelationshipsList = (function() {
        let relationshipList = {};

        function addRelationship(relationship) {
            relationship.canvasID = createRelationshipID();
            relationshipList[relationship.canvasID] = relationship;
        }

        function removeRelationship(relationship) {
            delete relationshipList[relationship.canvasID];
        }

        function getRelationshipByIdentifier(id) {
            return relationshipList[id];
        }

        // returns an array with the relationship class instances
        function getRelationshipList() {
            return Object.values(relationshipList);
        }

        return {
          add: addRelationship,
          remove: removeRelationship,
          getByID: getRelationshipByIdentifier,
          getAll: getRelationshipList,
        };
    })();

    function createRelationship(capability, requirement) {
        let newRelationship = new Relationship(capability, requirement);
        canvasRelationshipsList.add(newRelationship);
        infraRED.events.emit("relationship:create-new", newRelationship);
        return newRelationship;
    }

    function removeRelationship(relationship) {
        canvasRelationshipsList.remove(relationship);
    }

    function setUpEvents() {

    }

    function createRelationshipID() {
        function generateID() {
            return Math.floor(Math.random() * infraRED.settings.relationships.MAX_ID);
        }

        let newID = generateID();
        while (canvasRelationshipsList.getByID(newID) != undefined) newID = generateID();

        return newID;
    }

    return {
        init: function() {
            console.log("Starting the relationship functionality.");
            setUpEvents();
        },

        create: createRelationship,
        remove: removeRelationship,
    };
})();
infraRED.loader = (function() {
    function importTypesFromJSON(url) {
        let types;
        $.ajax({
            url: url,
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                types = data;
                console.log(`Importing types from ${url}...`);
            }
        });
        return types;
    }

    function loadNodeTypes() {
        let nodeTypes = importTypesFromJSON("nodes.json");
        let importedNodes = [];
        for (let type in nodeTypes) {
            let node = infraRED.nodes.new(type);
            
            const capabilities = nodeTypes[type].capabilities;
            const requirements = nodeTypes[type].requirements;
        
            if (capabilities) for (let capability in capabilities) {
                node.addCapability(capabilities[capability]);
            }
            if (requirements) for (let requirement in requirements) {
                node.addRequirement(requirements[requirement]);
            }
        
            importedNodes.push(node);
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    return {
        importNodes: loadNodeTypes,
    };
})();
// use this file to define the base layout for the editor
infraRED.editor = (function() {
    return {
        init: function() {
            console.log("%cCreating Editor...", "color: red");

            let categoryBar = $("<div>", { id: "infraRED-ui-category-bar"});
            $("#infraRED-ui-root").append(categoryBar);
            infraRED.editor.categoryBar.init();

            let resourceBar = $("<div>", { id: "infraRED-ui-resource-bar"});
            $("#infraRED-ui-root").append(resourceBar);
            infraRED.editor.resourceBar.init();

            let canvas = $("<div>", { id: "infraRED-ui-canvas"});
            $("#infraRED-ui-root").append(canvas);
            infraRED.editor.canvas.init();

            let menuBar = $("<div>", { id: "infraRED-ui-menu-bar"});
            $("#infraRED-ui-root").append(menuBar);
            infraRED.editor.menuBar.init();

            let statusBar = $("<div>", { id: "infraRED-ui-status-bar"});
            $("#infraRED-ui-root").append(statusBar);
            infraRED.editor.statusBar.init();

            infraRED.editor.nodes.init();
        },
    };
})();
// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

    let selectedCategory;
    function toggleCategory(category) {
        if (selectedCategory == category) {
            return false;
        } else {
            selectedCategory.toggleClass("category-selected");
            selectedCategory = category;
            category.toggleClass("category-selected");
            return true;
        }
    }

    return {
        init: function() {
            console.log("%cCreating Category Bar...", "color: #fd9694");

            categoryBar = $("#infraRED-ui-category-bar");

            let content = $("<div>", {
                id: "category-bar-content",
                class: "content",
            });
            categoryBar.append(content);

            let nodeCategory = $("<img>", {
                id: "node-category",
                class: "category category-selected",
                alt: "Node Category",
                src: "./icons/computer-svgrepo-com.svg",
            });

            nodeCategory.on("click", () => {
                if (toggleCategory(nodeCategory)) {
                    infraRED.editor.statusBar.log("Nodes!");
                }
            });

            selectedCategory = nodeCategory;
            content.append(nodeCategory);
        },
        get: function() {
            return categoryBar;
        },
    };
})();
// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;
    
    let tabList = {};
    function createTab(categoryName) {
        let newTab = $("<div>", {
            id: categoryName.toLowerCase() + "-tab",
            class: "tab",
        });

        newTab.append($("<div>", {
            id: categoryName.toLowerCase() + "-title",
            class: "title",
            text: categoryName,
        }));

        tabList[categoryName] = newTab;
        return newTab;
    }

    return {
        init: function() {
            console.log("%cCreating Resource Bar...", "color: #c2ff9f");

            resourceBar = $("#infraRED-ui-resource-bar");

            let content = $("<div>", {
                id: "resource-bar-content",
                class: "content",
            });

            let tabs = $("<div>", {
                id: "resource-tabs",
            });

            let nodesTab = createTab("Nodes");
            infraRED.loader.importNodes().forEach(node => {
                nodesTab.append(node.getDiv());
            });
            tabs.append(nodesTab);

            content.append(tabs);
            resourceBar.append(content);
        },
        get: function() {
            return resourceBar;
        },
    };
})();
// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridOffset(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function updateGrid() {
        let grid = document.createElementNS(SVGnamespace, "g");
        grid.id = "canvas-grid";

        let line;
        for (let row = gridSizeGap; row < canvasSizeH; row += gridSizeGap) {
            line = document.createElementNS(SVGnamespace, "line");
            $(line).attr({
                class: "canvas-grid-horizontal-line",
                x1: 0,
                x2: canvasSizeW,
                y1: row,
                y2: row,
            });
            grid.append(line);
        }

        for (let column = gridSizeGap; column < canvasSizeW; column += gridSizeGap) {
            line = document.createElementNS(SVGnamespace, "line");
            $(line).attr({
                class: "canvas-grid-vertical-line",
                y1: 0,
                y2: canvasSizeW,
                x1: column,
                x2: column,
            });
            grid.append(line);
        }
        return grid;
    }

    function drawRelationshipLine(capabilityDiv, requirementDiv) {
        let relationshipLine = document.createElementNS(SVGnamespace, "line");

        //TODO - this is the whole node position
        let capabilityPosition = capabilityDiv.parent().parent().position();
        let requirementPosition = requirementDiv.parent().parent().position();

        //TODO - x1,y1 may not be the requirement per say (and vice-versa)
        //but the values are interchangeable since it's a line from one to the other
        //bad if i required difference between the ends of the line

        //learned that .position() gives me the boundary of the margin box
        //so i must subtract that from the value the margin
        $(relationshipLine).attr({
            class: "canvas-relationship-line",
            x1: requirementPosition.left + requirementDiv.position().left,
            y1: requirementPosition.top + requirementDiv.position().top + parseFloat(requirementDiv.css("margin")) + requirementDiv.height(),
            x2: capabilityPosition.left + capabilityDiv.position().left + capabilityDiv.width(),
            y2: capabilityPosition.top + capabilityDiv.position().top + parseFloat(capabilityDiv.css("margin")) + capabilityDiv.height(),
        });

        return relationshipLine;
    }

    return {
        init: function() {
            console.log("%cCreating Canvas...", "color: #ffc895");

            canvas = $("#infraRED-ui-canvas");

            let content = $("<div>", {
                id: "canvas-content",
                class: "content",
            });

            content.droppable({
                tolerance: "fit",
                hoverClass: "canvas-hover-drop",
                accept: ".resource",

                drop: function(event, ui) {
                    let droppedNodeDiv = $(ui.helper).clone();

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop();
                        
                    let left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridOffset(left);
                    top = roundToGridOffset(top);

                    droppedNodeDiv.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });

                    droppedNodeDiv.removeClass("resource");
                    $(this).append(droppedNodeDiv);

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("id"));
                    //let any editor element know the node in question changed sides
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedNodeDiv);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).addClass("canvas-svg");
            $(canvasSVG).append(updateGrid());

            //TODO - redesign this whole process, I need to have named connections between these
            //must make use of the relationships.js file
            infraRED.events.on("canvas:draw-connection", (capabilityDiv, requirementDiv) => {
                //TODO - rethink my svg use,
                //right now i have a svg and divs in play together
                //maybe i should draw everything as a svg composition so i can more easily move elements 
                $(canvasSVG).append(drawRelationshipLine(capabilityDiv, requirementDiv));
                removePreviewLine();
            });

            function removePreviewLine() {
                $(previewRelationshipLine).remove();
                previewRelationshipLine = null;
                startingPosition = null;
                infraRED.events.emit("nodes:stop-draw-preview-line");
            }

            let lineEnd = { x: null, y: null };
            let previewRelationshipLine,
                startingPosition;

            $(canvasSVG).on("mousemove", (event) => {
                event.stopPropagation();
                // save the position of the cursor in relation to the canvas grid
                lineEnd.x = event.offsetX;
                lineEnd.y = event.offsetY;

                if (previewRelationshipLine) {
                    $(previewRelationshipLine).attr({
                        class: "canvas-preview-relationship-line",
                        x1: startingPosition.left,
                        y1: startingPosition.top,
                        x2: lineEnd.x,
                        y2: lineEnd.y,
                    });
                }
            });

            $(canvasSVG).on("mousedown", (event) => {
                removePreviewLine();
            });
            
            infraRED.events.on("canvas:start-draw-preview-line", (startingDiv) => {
                startingPosition = startingDiv.parent().parent().position();

                previewRelationshipLine = document.createElementNS(SVGnamespace, "line");
                $(previewRelationshipLine).attr({
                    class: "canvas-preview-relationship-line",
                    x1: startingPosition.left,
                    y1: startingPosition.top,
                    x2: lineEnd.x,
                    y2: lineEnd.y,
                });
                $(canvasSVG).append(previewRelationshipLine);
            });

            content.append(canvasSVG);
            canvas.append(content);
        }
    };
})();
// use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    function createLogResourcesButton() {
        let button = $("<button>", {
            id: "log-resources-button",
            class: "menu-bar-button",
            text: "Log Resources Nodes",
        });

        $(button).on("click", () => {
            infraRED.events.emit("nodes:log-resources");
        });
        return button;
    }

    function createLogCanvasButton() {
        let button = $("<button>", {
            id: "log-canvas-button",
            class: "menu-bar-button",
            text: "Log Canvas Nodes",
        });

        $(button).on("click", () => {
            infraRED.events.emit("nodes:log-canvas");
        });
        return button;
    }

    function createLogCurrentConnectionButton() {
        let button = $("<button>", {
            id: "log-current-connection-button",
            class: "menu-bar-button",
            text: "Log Current Connection",
        });

        $(button).on("click", () => {
            infraRED.events.emit("nodes:log-current-connection");
        });
        return button;
    }

    return {
        init: function() {
            console.log("%cCreating Menu Bar...", "color: #a6c9ff");

            menuBar = $("#infraRED-ui-menu-bar");

            let content = $("<div>", {
                id: "menu-bar-content",
                class: "content",
            });
            menuBar.append(content);

            content.append(createLogResourcesButton());
            content.append(createLogCanvasButton());
            content.append(createLogCurrentConnectionButton());
        },
        get: function() {
            return menuBar;
        },
    };
})();
// use this file to define the status bar
infraRED.editor.statusBar = (function() {
    let statusBar;
    let content;

    return {
        init: function() {
            console.log("%cCreating Status Bar...", "color: #ffe493");

            statusBar = $("#infraRED-ui-status-bar");

            content = $("<div>", {
                id: "status-bar-content",
                class: "content",
            });
            statusBar.append(content);
        },
        get: function() {
            return statusBar;
        },
        log: function(msg) {
            content.text(msg);
        }
    };
})();
// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    function createCanvasNode(canvasNode, droppedNodeDiv) {
        droppedNodeDiv.removeClass("resource-node ui-draggable-dragging");
        droppedNodeDiv.addClass("canvas-node");

        droppedNodeDiv.draggable({
            containment: "parent",
            stack: ".canvas-node",
            scroll: false,
            grid: [gridSizeGap, gridSizeGap],
        });

        droppedNodeDiv.on("dblclick", () => {
            droppedNodeDiv.remove();
            infraRED.nodes.remove(canvasNode);
            infraRED.events.emit("nodes:removed-node", canvasNode);
        });
    }

    let connectingRelationship = false;
    
    let capabilityNode = null;      
    let requirementNode = null;

    let capability = null;
    let requirement = null;

    let capabilityDiv = null;
    let requirementDiv = null;

    // this div holds the start of the Relationship preview line
    let startingDiv = null;

    function resetConnection() {
        // reset all the elements related to drawing the connection
        connectingRelationship = false;

        capabilityNode = null;
        capabilityDiv = null;
        capability = null;

        requirementNode = null;
        requirementDiv = null;
        requirement = null;

        if (startingDiv) startingDiv.toggleClass("selected-connectable");
        startingDiv = null; // might be unnecessary
    }

    infraRED.events.on("nodes:stop-draw-preview-line", () => {
        resetConnection();
    });
    
    function connectRelationship(node, event) {
        if (connectingRelationship) { // we already made the first selection and now are trying to make a connection
            if (capabilityNode == node || requirementNode == node) {
                console.log("Cannot connect capabilities/requirements of the same node...");
                return;
            }

            if ($(event.currentTarget).hasClass("capability") && requirementNode != null) {
                capabilityNode = node;
                capabilityDiv = $(event.currentTarget);
                capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
            } else if ($(event.currentTarget).hasClass("requirement") && capabilityNode != null) {
                requirementNode = node;
                requirementDiv = $(event.currentTarget);
                requirement = requirementNode.requirements[requirementDiv.attr("type")];
            } else {
                console.log("Please connect a capability to a requirement...");
                return;
            }

            infraRED.events.emit("canvas:create-connection", capability, capabilityNode, requirement, requirementNode);
            infraRED.events.emit("canvas:draw-connection", capabilityDiv, requirementDiv);

            resetConnection();
        } else { // we haven't chosen the first selection to start connecting
            if (capabilityNode == null && requirementNode == null) {
                if ($(event.currentTarget).hasClass("capability")) {
                    capabilityNode = node;
                    capabilityDiv = $(event.currentTarget);
                    capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
                } else if ($(event.currentTarget).hasClass("requirement")) {
                    requirementNode = node;
                    requirementDiv = $(event.currentTarget);
                    requirement = requirementNode.requirements[requirementDiv.attr("type")];
                }
                connectingRelationship = true;

                startingDiv = capabilityDiv ? capabilityDiv : requirementDiv;
                startingDiv.toggleClass("selected-connectable");

                // an element was selected as first, let's draw a line from that element
                infraRED.events.emit("canvas:start-draw-preview-line", startingDiv);
            }
        }
    }

    return {
        init: function() {
            $(".resource-node").draggable({
                appendTo: "#infraRED-ui-root",
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,
                revert: "invalid",
                revertDuration: 300,
                
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: "node",
                    });
                },
            });

            infraRED.events.on("nodes:log-current-connection", () => {
                console.log("Nodes", capabilityNode, requirementNode);
                console.log("Connections", capability, requirement);
                console.log("Start", startingDiv);
            });

            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeDiv) => {
                let canvasNode = infraRED.nodes.add(droppedNode);
                
                // "add" method will return null and we know we are supposed to remove
                //TODO - this may be prone to errors, since i may generate null through other ways
                if (canvasNode == null) {
                    droppedNodeDiv.remove(); return;
                }

                createCanvasNode(canvasNode, droppedNodeDiv);

                let capabilityDivs = $(droppedNodeDiv).children("div.capabilities").children();
                let requirementDivs = $(droppedNodeDiv).children("div.requirements").children();

                capabilityDivs.on("click", (event) => {
                    event.stopPropagation();
                    connectRelationship(canvasNode, event);
                });

                requirementDivs.on("click", (event) => {
                    event.stopPropagation();
                    connectRelationship(canvasNode, event);
                });
            });
        }
    };
})();
//TODO - maybe move these constants on to a settings loader or sth
//Canvas CONSTANTS
const canvasSizeW = 2000;
const canvasSizeH = 2000;
const gridSizeGap = 20;

const SVGnamespace = "http://www.w3.org/2000/svg";

//"backend" client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();