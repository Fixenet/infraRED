var infraRED = (function() {
    return {
        init: function() {
            console.log("infraRED is starting.");
    
            infraRED.events.DEBUG = true;
            infraRED.validator.init();
    
            infraRED.nodes.init();
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
            MAX_ID: 10000,
            EMPTY_NAME: "No Name Node",
        };
    })();

    capabilities = (function() {
        return {
        };
    })();

    requirements = (function() {
        return {
        };
    })();

    relationships = (function() {
        return {
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
    function createConnection(capability, requirement) {
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
    /**
     * Represents a capability of a Node, a possible functionality that can be served to another Node.
     */
    class Capability {
        constructor() {
            this.id = null;

            this.type = null;
        }
    }
    /**
     * Represents a requirement of a Node, a necessary functionality for a Node to work correctly.
     */
    class Requirement {
        constructor() {
            this.id = null;

            this.type = null;
        }
    }
    /**
     * Represents a connection between 2 Nodes via a Capability from one 
     * and a Requirement from another. 
     */
    class Relationship {
        constructor() {
            this.id = null;

            this.name = infraRED.settings.relationships.EMPTY_NAME;

            this.type = null;
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
        }

        setName(name) {
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
                class: "resource node resource-node",
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
            // this node is only present in the resource bar
            let printResult = `Resource Node:\n${this.resourceIdentifier}-\n${this.type}\n`;
            if (this.canvasIdentifier != null) { // this node also exists in the canvas
                printResult += `Canvas Node:\n${this.resourceIdentifier}:${this.canvasIdentifier}\n${this.name}\n`;
            }
            return printResult;
        }
    }

    // this list holds information about the node types loaded into infraRED
    resourceNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
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

    let currentID = 0;
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
        canvasNode.canvasID = createCanvasID();

        //TODO - this is an object atribution so i'm passing a reference
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
                accept: ".resource",

                drop: function(event, ui) {
                    let droppedElement = $(ui.helper).clone();

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop(),
                        
                        left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridCenter(left);
                    top = roundToGridCenter(top);

                    droppedElement.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });

                    droppedElement.removeClass("resource");

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("id"));
                    //let any editor element know the node in question changed sides
                    
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedElement);
            
                    $(this).append(droppedElement);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).addClass("canvas-svg");
            $(canvasSVG).append(updateGrid());

            //TODO - redesign this whole process, I need to have named connections between these
            //must make use of the relationships.js file
            infraRED.events.on("canvas:draw-connection", (req, cap, reqNode, capNode) => {
                //TODO - rethink my svg use,
                //right now i have a svg and divs in play together
                //maybe i should draw everything as a svg composition so i can more easily move elements 
                let connectionLine = document.createElementNS(SVGnamespace, "line");

                //TODO - this is the whole node position
                let requirementPosition = req.parent().parent().position();
                let capabilityPosition = cap.parent().parent().position();

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
                    $(this).data({
                        id: event.currentTarget.id,
                        type: "node",
                    });
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });

            var connecting = false;
            var reqNode = null;
            var capNode = null;
            var req = null;
            var cap = null;
            
            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeElement) => {
                droppedNodeElement.removeClass("resource-node ui-draggable-dragging");
                droppedNodeElement.addClass("canvas-node");
            
                let canvasNode = infraRED.nodes.add(droppedNode);

                //TODO - maybe fix this to be more intelligent
                let canvasDragStart = { "top": 0, "left": 0 };

                let canvasDraggedLast = { "top": -1, "left": -1 };
                let canvasDragged = { "top": 0, "left": 0 };

                let count = 0;
                
                droppedNodeElement.draggable({
                    containment: "parent",

                    //TODO - possibly change this element into a generic one that affects all categories
                    stack: ".canvas-node",
                    scroll: false,
                    grid: [gridSizeGap, gridSizeGap],

                    start: function(event, ui) {
                        //TODO - this is very bad pls change
                        canvasDraggedLast = { "top": -1, "left": -1 };

                        canvasDragStart.left = ui.position.left;
                        canvasDragStart.top = ui.position.top;
                    },
                    drag: function(event, ui) {
                        //TODO - this is very bad pls change
                        canvasDragged.left = canvasDragStart.left - ui.position.left;
                        canvasDragged.top = canvasDragStart.top - ui.position.top;
  
                        if (canvasDragged.left != canvasDraggedLast.left || canvasDragged.top != canvasDraggedLast.top) {
                            canvasDragStart.left = ui.position.left;
                            canvasDragStart.top = ui.position.top;

                            canvasDraggedLast.left = canvasDragged.left;
                            canvasDraggedLast.top = canvasDragged.top;
                        }
                    },
                    stop: function(event, ui) {
                    },
                });

                droppedNodeElement.on("dblclick", () => {
                    droppedNodeElement.remove();
                    infraRED.nodes.remove(canvasNode);
                });

                $(droppedNodeElement).children("div.requirements").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && cap != null) {
                        req = $(e.currentTarget);
                        reqNode = canvasNode;
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", reqNode, capNode);
                        infraRED.events.emit("canvas:draw-connection", req, cap, reqNode, capNode);

                        connecting = false; req = null; cap = null; reqNode = null; capNode = null;
                    } else if (req == null) {
                        req = $(e.currentTarget);
                        reqNode = canvasNode;
                        connecting = true;
                    } else {
                        console.log("Already chose requirement.");
                    }
                });

                $(droppedNodeElement).children("div.capabilities").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && req != null) {
                        cap = $(e.currentTarget);
                        capNode = canvasNode;
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", reqNode, capNode);
                        infraRED.events.emit("canvas:draw-connection", req, cap, reqNode, capNode);

                        connecting = false; req = null; cap = null;
                    } else if (cap == null) {
                        cap = $(e.currentTarget);
                        capNode = canvasNode;
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

const SVGnamespace = "http://www.w3.org/2000/svg";

//"backend" client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();

