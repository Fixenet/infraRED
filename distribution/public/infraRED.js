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
infraRED.canvas = (function() {
    //TODO - this infraRED element should be in charge of managing nodes and relationships together
    function createConnection(req, cap) {
        //TODO - do stuff with relationships
    }

    function setUpEvents() {
        infraRED.events.on("canvas:create-connection", createConnection);
    }

    return {
        init: function() {
            console.log("%cStarting the canvas functionality.", "color: #ffc895;");
            setUpEvents();
        },
    };
})();
infraRED.nodes = (function() {
    const MAX_ID = 10000;
    const EMPTY_NAME_NODE = "EMPTY_NAME_NODE";

    let currentID = 0;
    class Node {
        constructor(type) {
            this.resourceID = -1;
            this.canvasID = -1;

            this.name = EMPTY_NAME_NODE;
            
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

        addCapability(capability) {
            this.capabilities[capability] = {};
        }

        addRequirement(requirement) {
            this.requirements[requirement] = {};
        }

        getDiv() {
            let div = $("<div>", {
                id: this.resourceID,
                class: "node resource-node",
            });

            div.append($("<p>", { 
                class: "type", 
                text: this.type,
            }));

            if (!$.isEmptyObject(this.requirements)) {
                let requirements = $("<div>", {
                    class: "requirements",
                });

                Object.keys(this.requirements).forEach(requirement => {
                    requirements.append($("<p>", {
                        class: "requirement",
                        text: requirement,
                    }));
                });

                if (!$.isEmptyObject(this.requirements) && !$.isEmptyObject(this.capabilities)) {
                    requirements.css("border-bottom", "0.30em dashed black");
                }

                div.append(requirements);
            }
            
            if (!$.isEmptyObject(this.capabilities)) {
                let capabilities = $("<div>", {
                    class: "capabilities",
                });

                Object.keys(this.capabilities).forEach(capability => {
                    capabilities.append($("<p>", {
                        class: "capability",
                        text: capability,
                    }));
                });

                div.append(capabilities);
            }
            
            return div;
        }

        print() {
            return `${this.type}: ${this.resourceID}|${this.canvasID} = ${this.name}`;
        }
    }

    // this list holds information about the node types loaded into infraRED
    resourceNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            nodeList[node.resourceID] = node;
        }

        function getNodeByID(id) {
            return nodeList[id];
        }

        // returns an array with the node class instances
        function getNodeList() {
            return Object.values(nodeList);
        }

        return {
          add: addNode,
          getByID: getNodeByID,
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
            node.canvasID = createID();
            nodeList[node.canvasID] = node;
        }

        function removeNode(node) {
            delete nodeList[node.canvasID];
        }

        function getNodeByID(id) {
            return nodeList[id];
        }

        // returns an array with the node class instances
        function getNodeList() {
            return Object.values(nodeList);
        }

        return {
          add: addNode,
          remove: removeNode,
          getByID: getNodeByID,
          getAll: getNodeList,
        };
    })();

    function logResourceList() {
        console.log("Logging resources list...");
        let logString = [];

        resourceNodesList.getAll().forEach(node => {
            logString.push(node.print());
        });

        logString = logString.join(" || ");
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function logCanvasList() {
        console.log("Logging canvas list...");
        let logString = [];

        canvasNodesList.getAll().forEach(node => {
            logString.push(node.print());
        });

        logString = logString.join(" || ");
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function setUpEvents() {
        infraRED.events.on("nodes:log-resources", logResourceList);
        infraRED.events.on("nodes:log-canvas", logCanvasList);
    }

    function newResourceNode(type) {
        let node = new Node(type);
        node.resourceID = currentID++;

        resourceNodesList.add(node);

        infraRED.events.emit("nodes:add-resources", node);

        return node;
    }

    function moveNodeToCanvas(resourceNode) {
        let canvasNode = new Node(resourceNode.type);

        canvasNode.resourceID = resourceNode.resourceID;
        canvasNode.canvasID = createID();
        canvasNode.capabilities = resourceNode.capabilities;
        canvasNode.requirements = resourceNode.requirements;

        canvasNodesList.add(canvasNode);

        infraRED.events.emit("nodes:move-to-canvas", canvasNode);

        return canvasNode;
    }

    function removeNodeFromCanvas(canvasNode) {
        canvasNodesList.remove(canvasNode);
    }

    function createID() {
        function generateID() {
            return Math.floor(Math.random() * MAX_ID);
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
                class: "category",
                alt: "Node Category",
                src: "./icons/computer-svgrepo-com.svg",
            });

            nodeCategory.on("click", () => {
                infraRED.editor.statusBar.log("Nodes!");
            });

            let relationshipCategory = $("<img>", {
                id: "relationship-category",
                class: "category",
                alt: "Relationship Category",
                src: "./icons/arrow-svgrepo-com.svg",
            });

            relationshipCategory.on("click", () => {
                infraRED.editor.statusBar.log("Relationships!");
            });

            content.append(nodeCategory);
            content.append(relationshipCategory);
        },
        get: function() {
            return categoryBar;
        },
    };
})();
// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
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

    //TOOD - this should not be here, it is backend, move it outside UI folder
    function loadNodeTypes() {
        let nodeTypes = importNodeTypesFromJSON();
        let importedNodes = [];
        for (let type in nodeTypes) {
            let node = infraRED.nodes.new(type);
            
            const capabilities = nodeTypes[type].capabilities;
            const requirements = nodeTypes[type].requirements;
        
            if (capabilities) for(let capability in capabilities) {
                node.addCapability(capabilities[capability]);
            }
            if (requirements) for(let requirement in requirements) {
                node.addRequirement(requirements[requirement]);
            }
        
            importedNodes.push(node);
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    return {
        init: function() {
            console.log("%cCreating Resource Bar...", "color: #c2ff9f");

            resourceBar = $("#infraRED-ui-resource-bar");

            let content = $("<div>", {
                id: "resource-bar-content",
                class: "content",
            });

            loadNodeTypes().forEach(node => {
                content.append(node.getDiv());
            });

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

    //maybe move this somewhere or not, since only the canvas should deal with svg stuff
    const SVGnamespace = "http://www.w3.org/2000/svg";

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridCenter(position) {
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
                accept: ".resource-node",

                drop: function(event, ui) {
                    let droppedNodeElement = $(ui.helper).clone();

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("node"));

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop(),
                        
                        left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridCenter(left);
                    top = roundToGridCenter(top);

                    droppedNodeElement.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });
                    
                    //let any editor element know the node in question changed sides
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedNodeElement);
            
                    $(this).append(droppedNodeElement);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).addClass("canvas-svg");
            $(canvasSVG).append(updateGrid());

            //TODO - redesign this whole process, I need to have named connections between these
            //must make use of the relationships.js file
            infraRED.events.on("canvas:draw-connection", (req, cap) => {
                //TODO - rethink my svg use,
                //right now i have a svg and divs in play together
                //maybe i should draw everything as a svg composition so i can more easily move elements 
                let connectionLine = document.createElementNS(SVGnamespace, "line");

                //TODO - this is the whole node position
                let requirementPosition = req.parent().parent().position();
                let capabilityPosition = cap.parent().parent().position();

                console.log(req.position(), cap.position());

                //TODO - x1,y1 may not be the requirement per say (and vice-versa)
                //but the values are interchangeable since it's a line from one to the other

                //learned that .position() gives me the boundary of the margin box
                //so i must subtract that from the value the margin
                $(connectionLine).attr({
                    class: "canvas-relationship-line",
                    x1: requirementPosition.left + req.position().left,
                    y1: requirementPosition.top + req.position().top + parseFloat(req.css("margin")) + req.height(),
                    x2: capabilityPosition.left + cap.position().left + cap.width(),
                    y2: capabilityPosition.top + cap.position().top + parseFloat(cap.css("margin")) + cap.height(),
                });

                $(canvasSVG).append(connectionLine);
            });

            content.append(canvasSVG);

            canvas.append(content);
        }
    };
})();
// use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    return {
        init: function() {
            console.log("%cCreating Menu Bar...", "color: #a6c9ff");

            menuBar = $("#infraRED-ui-menu-bar");

            let content = $("<div>", {
                id: "menu-bar-content",
                class: "content",
            });
            menuBar.append(content);

            let logResourcesButton = $("<button>", {
                id: "log-resources-button",
                class: "menu-bar-button",
                html: "Log Resources Nodes",
            });

            $(logResourcesButton).on("click", () => {
                infraRED.events.emit("nodes:log-resources");
            });

            let logCanvasButton = $("<button>", {
                id: "log-canvas-button",
                class: "menu-bar-button",
                html: "Log Canvas Nodes",
            });

            $(logCanvasButton).on("click", () => {
                infraRED.events.emit("nodes:log-canvas");
            });

            content.append(logResourcesButton);
            content.append(logCanvasButton);
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
    return {
        init: function() {
            $(".resource-node").draggable({
                appendTo: "#infraRED-ui-root",
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,
                revert: "invalid",
                revertDuration: 300,
                create: function(event, ui) {
                    //HTML page loads with 90% width so it's responsive to the layout
                    //this then creates the draggable with static width so the width doesnt change at the moment of drag
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    $(this).data('node', event.currentTarget.id);
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });

            var connecting = false;
            var req = null;
            var cap = null;
            
            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeElement) => {
                droppedNodeElement.removeClass("resource-node");
                droppedNodeElement.addClass("canvas-node");
            
                droppedNodeElement.draggable({
                    containment: "parent",
                    stack: ".canvas-node",
                    scroll: false,
                    grid: [gridSizeGap, gridSizeGap],

                    drag: function() {
                    },
                });

                let canvasNode = infraRED.nodes.add(droppedNode);

                droppedNodeElement.on("dblclick", () => {
                    droppedNodeElement.remove();
                    infraRED.nodes.remove(canvasNode);
                });

                $(droppedNodeElement).children("div.requirements").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && cap != null) {
                        req = $(e.currentTarget);
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", req, cap);
                        infraRED.events.emit("canvas:draw-connection", req, cap);

                        connecting = false; req = null; cap = null;
                    } else if (req == null) {
                        req = $(e.currentTarget);
                        connecting = true;
                    } else {
                        console.log("Already chose requirement.");
                    }
                });

                $(droppedNodeElement).children("div.capabilities").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && req != null) {
                        cap = $(e.currentTarget);
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", req, cap);
                        infraRED.events.emit("canvas:draw-connection", req, cap);

                        connecting = false; req = null; cap = null;
                    } else if (cap == null) {
                        cap = $(e.currentTarget);
                        connecting = true;
                    } else {
                        console.log("Already chose capability.");
                    }
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

//"backend" client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();

