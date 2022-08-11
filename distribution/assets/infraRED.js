var infraRED = (function() {
    return {
        init: function() {
            console.log('infraRED is starting.');
    
            infraRED.events.DEBUG = false;
            infraRED.validator.init();

            infraRED.nodes.init();
            infraRED.relationships.init();
            infraRED.canvas.init();

            infraRED.loader.loadNodes();

            infraRED.deployer.init();
    
            console.log('infraRED finished booting.');
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

        if (infraRED.events.DEBUG) console.log('Emitting event called: ' + eventName);
        
        if (handlers[eventName]) {
            for (let i = 0; i < handlers[eventName].length; i++) {
                try {
                    handlers[eventName][i].apply(null, args);
                } catch(err) {
                    console.warn('infraRED.events.emit error: ['+eventName+'] ' + (err.toString()));
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
            console.log('Starting the validator functionality.');
        },

        // validate node type
        validateNodeMode: function(nodeMode) {
            return typeof(nodeMode) === 'string' && (nodeMode === 'capability' || nodeMode === 'requirement');
        },
        // better validation will be done to ensure proper regex rules
        validateNodeType: function(nodeType) {
            return typeof(nodeType) === 'string';
        },
        validateRelationshipType: function(relationshipType) {
            return typeof(relationshipType) === 'string';
        },
    };
})();
infraRED.settings = (function() {
    canvas = (function() {
        return {
            canvasSizeW: 2000,
            canvasSizeH: 2000,
            gridSizeGap: 20,
            SVGnamespace: 'http://www.w3.org/2000/svg',
        };
    })();

    nodes = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: 'No Name Node',
        };
    })();

    capabilities = (function() {
        return {
            EMPTY_NAME: 'No Name Capability',
        };
    })();

    requirements = (function() {
        return {
            EMPTY_NAME: 'No Name Requirement',
        };
    })();

    relationships = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: 'No Name Relationship',
        };
    })();

    return {
        canvas: canvas,
        capabilities: capabilities,
        requirements: requirements,
        nodes: nodes,
        relationships: relationships,
    };
})();
infraRED.canvas = (function() {
    function resetConnectionVariables() {
        return {
            capability: null,
            capabilitySVG: null,

            requirement: null,
            requirementSVG: null,

            isConnecting: false,
            typeConnecting: null,
        };
    }

    function createRelationship() {
        let relationship = infraRED.relationships.create(connectionVariables.capability, connectionVariables.requirement);
        infraRED.nodes.canvasList.getByID(connectionVariables.capability.nodeID).addRelationship(relationship);
        infraRED.nodes.canvasList.getByID(connectionVariables.requirement.nodeID).addRelationship(relationship);

        infraRED.events.emit('canvas:create-relationship-connection', connectionVariables, relationship);

        connectionVariables = resetConnectionVariables();
    }

    let connectionVariables = resetConnectionVariables();
    function createConnection(connectable, connectableSVG) {
        if (connectionVariables.isConnecting) { // we already made the first selection and now are trying to make a connection
            try {
                if (connectionVariables.typeConnecting != connectable.type) {
                    throw new Error('Cannot connect capabilities/requirements of different types...');
                }
                if (connectable.mode === 'capability' && connectionVariables.capability == null) {
                    connectionVariables.capability = connectable;
                    connectionVariables.capabilitySVG = connectableSVG;
                } else if (connectable.mode === 'requirement' && connectionVariables.requirement == null) {
                    connectionVariables.requirement = connectable;
                    connectionVariables.requirementSVG = connectableSVG;
                } else {
                    throw new Error('Please connect a capability and a requirement together...');
                }
                if (connectionVariables.capability.nodeID == connectionVariables.requirement.nodeID) {
                    throw new Error('Cannot connect capabilities/requirements of the same node...');
                }
                createRelationship();
            } catch (error) {
                infraRED.editor.statusBar.log(error);
            }
        } else { // we haven't chosen the first selection to start connecting
            if (connectionVariables.capability == null && connectionVariables.requirement == null) { // make sure
                if (connectable.mode === 'capability') {
                    connectionVariables.capability = connectable;
                    connectionVariables.capabilitySVG = connectableSVG;
                } else if (connectable.mode === 'requirement') {
                    connectionVariables.requirement = connectable;
                    connectionVariables.requirementSVG = connectableSVG;
                }
                connectionVariables.isConnecting = true;
                connectionVariables.typeConnecting = connectable.type;
                connectableSVG.addClass('selected-connectable');
                infraRED.events.emit('canvas:create-relationship-preview-line', connectableSVG);
            }
        }
    }

    function resetConnection() {
        if(connectionVariables.capability) connectionVariables.capabilitySVG.removeClass('selected-connectable');
        if(connectionVariables.requirement) connectionVariables.requirementSVG.removeClass('selected-connectable');

        connectionVariables = resetConnectionVariables();
    }

    function maxNodesReachedInCanvas() {
        infraRED.editor.statusBar.log('Can no longer add more Nodes to the Canvas\nPlease remove some before continuing...');
    }

    function logConnectionVariables() {
        console.log(connectionVariables);
    }

    return {
        init: function() {
            console.log('%cStarting the canvas functionality.', 'color: #ffc895;');

            infraRED.events.on('canvas:log-connection-variables', logConnectionVariables);
            infraRED.events.on('canvas:create-connection', createConnection);
            infraRED.events.on('canvas:reset-connection', resetConnection);
            infraRED.events.on('nodes:max-nodes-in-canvas', maxNodesReachedInCanvas);
        },
    };
})();
infraRED.nodes = (function() {
    /**
     * Represents a capability or requirement of a Node, 
     * a possible functionality that can be served/received to/from another Node.
     * These have no id since the type is a unique identifier in each Node.
     */

    //TODO - global for nodes ? stuff for drawing
    let canvasSelectedDragNode = null;

    class Connectable {
        constructor(mode, type, nodeID) {
            this.name = null;

            // select between requirement and capability connectable
            if (infraRED.validator.validateNodeMode(mode)) this.mode = mode;

            // type of the connectable
            this.type = type;

            // nodeID on the canvas of the parent node to this connectable
            this.nodeID = nodeID;
        }

        getDiv() {
            let connectable = $('<div>', {
                id: this.type,
                class: 'connectable ' + this.mode,
                text: this.name ? this.name : this.type,
            });

            connectable.attr({
                name: this.name,
                type: this.type,
            });

            return connectable;
        }

        getSVG() {
            let connectable = new SVG.G().addClass('connectable ' + this.mode);

            connectable.height = 20;
            connectable.spacing = connectable.height + 5;

            connectable.marginInline = 2;
            connectable.width = 200 - connectable.marginInline * 2;

            connectable.attr({
                name: this.name,
                type: this.type,
            });

            let background = connectable.rect(connectable.width, connectable.height).move(0,0);

            connectable.plain(this.type).move(0,0).cx(connectable.width/2);

            connectable.on('click', (event) => {
                event.stopPropagation();
                // handles logic and svg drawing
                infraRED.events.emit('canvas:create-connection', this, background);
            });

            return connectable;
        }

        print() {
            let printResult = `${this.mode} - ${this.type}`;
            return printResult;
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

            this.relationships = [];
        }

        setName(name) {
            if (infraRED.validator.validateNodeType(name)) {
                this.name = name;
            } else {
                console.log('Incorrect Node name was given.');
            }
        }

        addCapability(capabilityType) {
            // index by type since only one of each type exists in each Node
            let capability = new Connectable('capability', capabilityType, this.canvasID);
            this.capabilities[capabilityType] = capability;
        }

        addRequirement(requirementType) {
            // index by type since only one of each type exists in each Node
            let requirement = new Connectable('requirement', requirementType, this.canvasID);
            this.requirements[requirementType] = requirement;
        }

        addRelationship(relationship) {
            this.relationships.push(relationship);
        }

        getDiv() {
            let div = $('<div>', {
                id: this.resourceID,
                class: 'resource node resource-node',
            });

            div.append($('<div>', { 
                class: 'type', 
                text: this.type,
            }));

            if (!$.isEmptyObject(this.requirements)) {
                let requirements = $('<div>', {
                    class: 'requirements',
                });

                Object.values(this.requirements).forEach(requirement => {
                    requirements.append(requirement.getDiv());
                });

                // add a border line to separate capabilities from requirements if both exist
                if (!$.isEmptyObject(this.capabilities)) {
                    requirements.addClass('connectable-separator');
                }

                div.append(requirements);
            }
            
            if (!$.isEmptyObject(this.capabilities)) {
                let capabilities = $('<div>', {
                    class: 'capabilities',
                });

                Object.values(this.capabilities).forEach(capability => {
                    capabilities.append(capability.getDiv());
                });

                div.append(capabilities);
            }
            
            return div;
        }

        getSVG() {
            let node = new SVG.G().addClass('canvas-node');
            node.width = 200;

            let background = node.rect().radius(10).addClass('background');

            let type = node.group().addClass('type');
            type.height = 20;
            // adds the type background
            let typeBackground = type.rect().radius(10).move(10, 7);
            // adds the type text
            let typeText = type.text(this.type);

            typeBackground.size(node.width-20, type.height);

            let cutAt = 18;
            if (this.type.length > cutAt) {
                typeText.plain(this.type.substring(0, cutAt) + '...');
            }
            typeText.move(10, 7).cx(node.width/2);

            let drawingY = 8;
            if (!$.isEmptyObject(this.requirements)) {
                let requirements = node.group().addClass('requirements');

                Object.values(this.requirements).forEach((requirement) => {
                    let requirementSVG = requirement.getSVG();
                    requirements.add(requirement.getSVG().move(requirementSVG.marginInline, drawingY += requirementSVG.spacing));
                });

                // add a border line to separate capabilities from requirements if both exist
                if (!$.isEmptyObject(this.capabilities)) {
                    node.line(0, drawingY + 25, node.width, drawingY + 25).addClass('connectable-separator');
                    drawingY += 5;
                }
            }
            
            if (!$.isEmptyObject(this.capabilities)) {
                let capabilities = node.group().addClass('capabilities');

                Object.values(this.capabilities).forEach((capability) => {
                    let capabilitySVG = capability.getSVG();
                    capabilities.add(capabilitySVG.move(capabilitySVG.marginInline, drawingY += capabilitySVG.spacing));
                });
            }

            node.height = drawingY + 30;
            background.size(node.width, node.height);

            node.on('mousedown', (event) => {
                event.stopPropagation();
                canvasSelectedDragNode = {SVG: node, instance: this};
                //styled to have a nice grabbing / not grabbing css
                node.css('cursor', 'grabbing');

                canvasSelectedDragNode.offsetX = event.offsetX - canvasSelectedDragNode.SVG.x();
                canvasSelectedDragNode.offsetY = event.offsetY - canvasSelectedDragNode.SVG.y();
                canvasSelectedDragNode.instance.relationships.forEach((relationship) => {
                    if (relationship.capability.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a capability
                        relationship.lineOffsetPlot = [
                            [relationship.lineSVG.plot()[0][0] - node.x(), relationship.lineSVG.plot()[0][1] - node.y()],
                            relationship.lineSVG.plot()[1]
                        ];
                    } else if (relationship.requirement.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a requirement
                        relationship.lineOffsetPlot = [
                            relationship.lineSVG.plot()[0],
                            [relationship.lineSVG.plot()[1][0] - node.x(), relationship.lineSVG.plot()[1][1] - node.y()]
                        ];
                    }
                });
            });

            node.on('mouseup', (event) => {
                event.stopPropagation();
                //styled to have a nice grabbing / not grabbing css
                node.css('cursor', 'grab');
                canvasSelectedDragNode = null;
            });

            return node;
        }

        print() {
            // this node is only present in the resource bar
            let printResult = `ResourceID ${this.resourceID}: ${this.type}`;
            if (this.canvasID != null) { // this node also exists in the canvas
                printResult += `\nCanvasID ${this.canvasID}: ${this.name}`;
            } else {
                printResult += `\n${JSON.stringify(this.properties)}`;
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
        console.log('Logging resources list...');
        let logString = [];

        resourceNodesList.getAll().forEach(node => {
            logString.push(node.print());
        });

        logString = logString.join('\n');
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function logCanvasList() {
        console.log('Logging canvas list...');
        let logString = [];

        canvasNodesList.getAll().forEach(node => {
            console.log(node);
            logString.push(node.print());
        });

        logString = logString.join('\n');
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function newResourceNode(type) {
        let newNode = new Node(type);
        resourceNodesList.add(newNode);
        infraRED.events.emit('nodes:add-resources', newNode);
        return newNode;
    }

    function moveNodeToCanvas(resourceNode) {
        // stop the node from entering the canvas if we are at max value
        if (canvasNodesList.getAll().length == infraRED.settings.nodes.MAX_ID) {
            infraRED.events.emit('nodes:max-nodes-in-canvas');
            //TODO - disallow any further action, this may not be correctly propagated
            return null;
        }

        let canvasNode = new Node(resourceNode.type);
        canvasNode.resourceID = resourceNode.resourceID;
        canvasNode.canvasID = createCanvasID();

        for (let capability of Object.values(resourceNode.capabilities)) canvasNode.addCapability(capability.type);
        for (let requirement of Object.values(resourceNode.requirements)) canvasNode.addRequirement(requirement.type);

        canvasNodesList.add(canvasNode);
        infraRED.events.emit('nodes:move-to-canvas', canvasNode);

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
            console.log('Starting the nodes functionality.');

            infraRED.events.on('nodes:log-resources', logResourceList);
            infraRED.events.on('nodes:log-canvas', logCanvasList);
        },

        new: newResourceNode,
        add: moveNodeToCanvas,
        remove: removeNodeFromCanvas,

        resourceList: resourceNodesList,
        canvasList: canvasNodesList,

        draggingNode: function() {
            if (canvasSelectedDragNode != null) return canvasSelectedDragNode;
        },
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

            this.type = capability.type;

            this.capability = capability;
            this.requirement = requirement;

            //lines start at their capability
            //and end at their requirement
            this.lineSVG = null;
            //helps guide the line while it's moving
            this.lineOffsetPlot = null;
        }

        addLine(lineSVG) {
            this.lineSVG = lineSVG;
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

        function getRelationshipEssentialsJSON() {
            let result = {};
            for (let relationship of Object.values(relationshipList)) {
                result[relationship.canvasID] = {
                    type: relationship.type,
                    capabilityNode: relationship.capability.node.resourceID + ' ' + relationship.capability.node.type,
                    requirementNode: {
                        id: relationship.requirement.node.canvasID,
                        type: relationship.requirement.node.type,
                    },
                    
                };
            }
            return result;
        }

        return {
          add: addRelationship,
          remove: removeRelationship,
          getByID: getRelationshipByIdentifier,
          getAll: getRelationshipList,
          getJSON: getRelationshipEssentialsJSON,
        };
    })();

    function createRelationship(capability, requirement) {
        let newRelationship = new Relationship(capability, requirement);
        canvasRelationshipsList.add(newRelationship);
        infraRED.events.emit('relationship:create-new', newRelationship);
        return newRelationship;
    }

    function removeRelationship(relationship) {
        canvasRelationshipsList.remove(relationship);
    }

    function logRelationshipList() {
        console.log('Logging canvas relationship list...');
        let logString = [];

        canvasRelationshipsList.getAll().forEach(relationship => {
            console.log(relationship);
            logString.push(relationship.capability.print(), relationship.requirement.print());
        });

        logString = logString.join('\n');
        infraRED.editor.statusBar.log(logString);
        console.log(logString);
    }

    function setUpEvents() {
        infraRED.events.on('nodes:log-relationships', logRelationshipList);
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
            console.log('Starting the relationship functionality.');
            setUpEvents();
        },

        create: createRelationship,
        remove: removeRelationship,

        canvasList: canvasRelationshipsList,
    };
})();
infraRED.loader = (function() {
    function getNodesFromServerRegistry() {
        let types;
        $.ajax({
            url: '/listNodes',
            dataType: 'json',
            async: false,

            success: function(data) {
                types = data;
            }
        });
        if (typeof(types) !== 'object') {
            throw "Couldn't fetch node list.";
        }
        return types;
    }

    function loadNodesFromServerRegistry() {
        let types = getNodesFromServerRegistry();
        for (let type in types) {
            let newNode = infraRED.nodes.new(type);
            for (let capability in types[type].capabilities) {
                newNode.addCapability(capability);
            }
            for (let requirement in types[type].requirements) {
                newNode.addRequirement(requirement);
            }
            newNode.properties.category = types[type].category;
        }
    }

    return {
        loadNodes: loadNodesFromServerRegistry,
        getNodes: getNodesFromServerRegistry,
    };
})();
infraRED.deployer = (function () {
    return {
        init: function() {
            console.log('Starting the deployment functionality.');
        }
    };
})();
// use this file to define the base layout for the editor
infraRED.editor = (function() {
    return {
        init: function() {
            console.log('%cCreating Editor...', 'color: red');

            let resourceBar = $('<div>', { id: 'infraRED-ui-resource-bar'});
            $('#infraRED-ui-root').append(resourceBar);
            infraRED.editor.resourceBar.init();

            let categoryBar = $('<div>', { id: 'infraRED-ui-category-bar'});
            $('#infraRED-ui-root').append(categoryBar);
            infraRED.editor.categoryBar.init();

            let canvas = $('<div>', { id: 'infraRED-ui-canvas'});
            $('#infraRED-ui-root').append(canvas);
            infraRED.editor.canvas.init();

            let menuBar = $('<div>', { id: 'infraRED-ui-menu-bar'});
            $('#infraRED-ui-root').append(menuBar);
            infraRED.editor.menuBar.init();

            let statusBar = $('<div>', { id: 'infraRED-ui-status-bar'});
            $('#infraRED-ui-root').append(statusBar);
            infraRED.editor.statusBar.init();

            infraRED.editor.nodes.init();
        },
    };
})();
// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

    let selectedCategory = null;
    function toggleCategory(category) {
        if (selectedCategory == category) {
            return false;
        } else if (selectedCategory == null) { // first time selecting a category
            selectedCategory = category;
            selectedCategory.toggleClass('category-selected');
            infraRED.events.emit('category:change-category', null, selectedCategory.attr("name"));
            return true;
        } else {
            selectedCategory.toggleClass('category-selected');
            infraRED.events.emit('category:change-category', selectedCategory.attr("name"), category.attr("name"));
            selectedCategory = category;
            category.toggleClass('category-selected');
            return true;
        }
    }

    function createNewCategory(name, img) {
        let newCategory = $('<img>', {
            id: `${name}-category`,
            class: 'category',
            alt: `${name} Category`,
            src: img,
        });

        newCategory.attr("name", name);

        newCategory.on('click', function() {
            if (toggleCategory(newCategory)) {
                infraRED.editor.statusBar.log(`${name} is now showing!`);
            }
        });

        return newCategory;
    }

    return {
        init: function() {
            console.log('%cCreating Category Bar...', 'color: #fd9694');

            categoryBar = $('#infraRED-ui-category-bar');

            let content = $('<div>', {
                id: 'category-bar-content',
                class: 'content',
            });
            categoryBar.append(content);

            let nodesList = infraRED.nodes.resourceList.getAll();

            let categoryList = [];
            let newCategory;
            for (let node of nodesList) {
                if (categoryList.indexOf(node.properties.category.name) == -1) {
                    newCategory = createNewCategory(node.properties.category.name, node.properties.category.img);
                    content.append(newCategory);
                    categoryList.push(node.properties.category.name);
                }
            }
            //automatically open a category section (last one)
            toggleCategory(newCategory);
        },
        get: function() {
            return categoryBar;
        },
    };
})();
// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;
    
    function createTab(categoryName) {
        let newTab = $('<div>', {
            id: categoryName.toLowerCase() + '-tab',
            class: 'tab',
        });

        newTab.append($('<div>', {
            id: categoryName.toLowerCase() + '-title',
            class: 'title',
            text: categoryName,
        }));

        newTab.hide();
        return newTab;
    }

    let tabList = {};
    function changeTabs(fromTab, toTab) {
        if (fromTab != null) tabList[fromTab].hide();
        tabList[toTab].show();
    }

    return {
        init: function() {
            console.log('%cCreating Resource Bar...', 'color: #c2ff9f');

            resourceBar = $('#infraRED-ui-resource-bar');

            let content = $('<div>', {
                id: 'resource-bar-content',
                class: 'content',
            });

            let tabs = $('<div>', {
                id: 'resource-tabs',
            });

            let nodesList = infraRED.nodes.resourceList.getAll();

            for (let node of nodesList) {
                let category = node.properties.category.name;
                if (tabList[category] == null) {
                    tabList[category] = createTab(category);
                    tabs.append(tabList[category]);
                } 
                tabList[category].append(node.getDiv());
            }

            content.append(tabs);
            resourceBar.append(content);

            infraRED.events.on('category:change-category', changeTabs);
        },
        get: function() {
            return resourceBar;
        },
    };
})();
// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    const canvasSizeW = infraRED.settings.canvas.canvasSizeW;
    const canvasSizeH = infraRED.settings.canvas.canvasSizeH;
    const gridSizeGap = infraRED.settings.canvas.gridSizeGap;

    const SVGnamespace = infraRED.settings.canvas.SVGnamespace;

    let canvasDraw; // variable used to draw on the canvas, from SVG.js 3.0

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridOffset(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function createGrid() {
        let grid = canvasDraw.group().attr({ id: 'canvas-grid' });

        for (let row = gridSizeGap; row < canvasSizeH; row += gridSizeGap) {
            grid.line(0, row, canvasSizeW, row).addClass('canvas-grid-horizontal-line');
        }

        for (let column = gridSizeGap; column < canvasSizeW; column += gridSizeGap) {
            grid.line(column, 0, column, canvasSizeW).addClass('canvas-grid-vertical-line');
        }
    }

    function createCanvasEnvironment(canvasSVG) {
        canvasDraw = SVG(canvasSVG).size(canvasSizeW, canvasSizeH).addClass('canvas-svg');
        createGrid();
    }

    let lineEndPosition  = { x: null, y: null };
    let relationshipPreviewLine = null,
        startingPosition = { rightSide: true, left: null, right: null, top: null };

    function removeRelationshipPreviewLine() {
        relationshipPreviewLine.remove();
        relationshipPreviewLine = null;
        infraRED.events.emit('canvas:reset-connection');
    }

    function drawRelationshipPreviewLine() {
        lineCoordinates = [startingPosition.rightSide ? startingPosition.right : startingPosition.left,
            startingPosition.top,
            lineEndPosition.x,
            lineEndPosition.y];

        if (relationshipPreviewLine != null) {
            relationshipPreviewLine = relationshipPreviewLine.plot(lineCoordinates);
        } else {
            relationshipPreviewLine = canvasDraw.line(lineCoordinates);
            relationshipPreviewLine.marker('end', 4, 4, function(add) {
                add.polygon().plot([ // create a triangle
                    [1,0],
                    [1,4],
                    [4,2]
                ]).fill('#0e83bd');
            });
            relationshipPreviewLine.addClass('canvas-preview-relationship-line');
        }
    }

    function drawRelationshipLine(capabilitySVG, requirementSVG) {
        let start = { x: capabilitySVG.x(), y: capabilitySVG.cy()};
        let end = { x: requirementSVG.x(), y: requirementSVG.cy()};

        if (start.x < end.x) { // we are to the right
            start.x += capabilitySVG.width();
        } else {
            end.x += requirementSVG.width();
        }

        let relationshipLine = canvasDraw.line(start.x, start.y, end.x, end.y);
        relationshipLine.addClass('canvas-relationship-line');
        return relationshipLine;
    }

    function createRelationshipConnection(connectionVariables, relationship) {
        let capabilitySVG = connectionVariables.capabilitySVG,
            requirementSVG = connectionVariables.requirementSVG;

        //draw the final line
        capabilitySVG.removeClass('selected-connectable');
        requirementSVG.removeClass('selected-connectable');
        let line = drawRelationshipLine(capabilitySVG, requirementSVG);

        //logic so that lines can react to mousemove of their node
        relationship.addLine(line);

        //clean relationship preview line
        if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
    }

    function createRelationshipPreviewLine(connectable) {
        startingPosition = {
            // left side
            left: connectable.x(),
            // right side
            right: connectable.x() + connectable.width(),
            // middle height
            top: connectable.cy(),
        };

        lineEndPosition = { 
            x: startingPosition.left, 
            y: startingPosition.top 
        };

        drawRelationshipPreviewLine();
    }

    function onContentDrop(event, ui) {
        // use this so the node drops in the canvas on the place where the mouse was lifted at
        let draggableOffset = ui.helper.offset(),
        droppableOffset = $(this).offset(),
        scrollOffsetLeft = $(this).scrollLeft(),
        scrollOffsetTop = $(this).scrollTop();

        let left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

        left = roundToGridOffset(left);
        top = roundToGridOffset(top);

        let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data('id'));

        //let any editor element know the node in question changed sides
        infraRED.events.emit('nodes:canvas-drop', resourceNode, {left, top});
    }

    function contentDropSuccess(canvasNode, {left, top}) {
        let canvasNodeSVG = canvasNode.getSVG();
        canvasNodeSVG.move(left, top);
        canvasDraw.add(canvasNodeSVG);
    }

    function onMouseMove(event) {
        if (relationshipPreviewLine != null) {
            // save the position of the cursor in relation to the canvas grid
            lineEndPosition.x = event.offsetX;
            lineEndPosition.y = event.offsetY;
            // check if we are to the right of the connectable
            startingPosition.rightSide = lineEndPosition.x > startingPosition.right;
            drawRelationshipPreviewLine();
        }
        // this movement only happens if we have a selected node for moving
        // we then only use the 'canvasSelectedDragNode' variable to do movement based on itself
        // and not the triggerer of the 'mousemove' event
        let canvasSelectedDragNode = infraRED.nodes.draggingNode();
        if (canvasSelectedDragNode != null) {
            let dragX = event.offsetX - canvasSelectedDragNode.offsetX;
            let dragY = event.offsetY - canvasSelectedDragNode.offsetY;

            canvasSelectedDragNode.SVG.x(dragX);
            canvasSelectedDragNode.SVG.y(dragY);

            let lineOffset;
            //propagate this movement to all relationship lines
            canvasSelectedDragNode.instance.relationships.forEach((relationship) => {
                if (relationship.capability.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a capability
                    //update line start
                    lineOffset = { x: relationship.lineOffsetPlot[0][0], y: relationship.lineOffsetPlot[0][1]};
                    //maintain the other side in the same position since it's not moving
                    relationship.lineSVG.plot([[dragX + lineOffset.x, dragY + lineOffset.y], relationship.lineSVG.plot()[1]]);
                } else if (relationship.requirement.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a requirement
                    //update line end
                    lineOffset = { x: relationship.lineOffsetPlot[1][0], y: relationship.lineOffsetPlot[1][1]};
                    //maintain the other side in the same position since it's not moving
                    relationship.lineSVG.plot([relationship.lineSVG.plot()[0], [dragX + lineOffset.x, dragY + lineOffset.y]]);
                }
            });
        }
    }

    function onMouseClick(event) {
        if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
    }

    return {
        init: function() {
            console.log('%cCreating Canvas...', 'color: #ffc895');

            canvas = $('#infraRED-ui-canvas');

            let content = $('<div>', {
                id: 'canvas-content',
                class: 'content',
            });

            content.droppable({
                tolerance: 'fit',
                hoverClass: 'canvas-hover-drop',
                accept: '.resource',
                drop: onContentDrop,
            });

            infraRED.events.on('nodes:canvas-drop-success', contentDropSuccess);

            let canvasSVG = document.createElementNS(SVGnamespace, 'svg');
            createCanvasEnvironment(canvasSVG);

            canvasDraw.on('mousemove', onMouseMove);
            canvasDraw.on('click', onMouseClick);

            infraRED.events.on('canvas:create-relationship-connection', createRelationshipConnection);
            infraRED.events.on('canvas:create-relationship-preview-line', createRelationshipPreviewLine);

            content.append(canvasSVG);
            canvas.append(content);
        },
    };
})();
// use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    function createLogResourcesButton() {
        let button = $('<button>', {
            id: 'log-resources-button',
            class: 'menu-bar-button',
            text: 'Log Resources Nodes',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-resources');
        });

        return button;
    }

    function createLogCanvasButton() {
        let button = $('<button>', {
            id: 'log-canvas-button',
            class: 'menu-bar-button',
            text: 'Log Canvas Nodes',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-canvas');
        });

        return button;
    }

    function createLogRelationshipsButton() {
        let button = $('<button>', {
            id: 'log-relationships-button',
            class: 'menu-bar-button',
            text: 'Log Relationships',
        });

        $(button).on('click', () => {
            infraRED.events.emit('nodes:log-relationships');
        });

        return button;
    }

    function createLogCurrentConnectionButton() {
        let button = $('<button>', {
            id: 'log-current-connection-button',
            class: 'menu-bar-button',
            text: 'Log Current Connection',
        });

        $(button).on('click', () => {
            infraRED.events.emit('canvas:log-connection-variables');
        });

        return button;
    }

    function createDeployButton() {
        let button = $('<button>', {
            id: 'deploy-button',
            class: 'menu-bar-button',
            text: 'Deploy',
        });

        $(button).on('click', () => {
            infraRED.events.emit('relationships:deploy');

            //TODO - deepcopy of my node obj list, can probably be done better
            // i can also use this to only pass up to the server the values i want (reduce clutter)
            let cleanNodeList = [];
            for (let node of infraRED.nodes.canvasList.getAll()) {
                let cleanNode = jQuery.extend(true, {}, node);

                let cleanList = [];
                for (let relationship of cleanNode.relationships) {
                    let clean = jQuery.extend(true, {}, relationship);
                    delete clean.lineSVG;
                    delete clean.lineOffsetPlot;
                    cleanList.push(clean);
                }
                cleanNode.relationships = cleanList;
                cleanNodeList.push(cleanNode);
            }

            // talk to server to start deployment
            $.ajax({
                method: 'POST',
                url: '/deploy',
                contentType: 'application/json',
                dataType: 'json',
                async: false,

                data: JSON.stringify({"nodes": cleanNodeList}),
    
                // success function places value inside the return variable
                success: function(data) {
                    console.log(data);
                }
            });
        });

        return button;
    }

    return {
        init: function() {
            console.log('%cCreating Menu Bar...', 'color: #a6c9ff');

            menuBar = $('#infraRED-ui-menu-bar');

            let content = $('<div>', {
                id: 'menu-bar-content',
                class: 'content',
            });
            menuBar.append(content);

            content.append(createLogResourcesButton());
            content.append(createLogCanvasButton());
            content.append(createLogRelationshipsButton());
            content.append(createLogCurrentConnectionButton());
            content.append(createDeployButton());
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
            console.log('%cCreating Status Bar...', 'color: #ffe493');

            statusBar = $('#infraRED-ui-status-bar');

            content = $('<div>', {
                id: 'status-bar-content',
                class: 'content',
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
    function onCanvasDrop(droppedNode, coordinates) {
        let canvasNode = infraRED.nodes.add(droppedNode);
                
        // 'add' method will return null and we know we are supposed to remove
        //TODO - this may be prone to errors, since i may generate null through other ways
        if (canvasNode != null) {
            infraRED.events.emit('nodes:canvas-drop-success', canvasNode, coordinates);
        }
    }

    return {
        init: function() {
            $('.resource-node').draggable({
                appendTo: '#infraRED-ui-root',
                containment: '#infraRED-ui-root',
                helper: 'clone',
                scroll: false,
                revert: 'invalid',
                revertDuration: 300,
                
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: 'node',
                    });
                },
            });

            infraRED.events.on('nodes:canvas-drop', onCanvasDrop);
        }
    };
})();
//'backend' for client side
infraRED.init();
//frontend/views for client side
infraRED.editor.init();

//ask the user if they really want to leave
//in case we implement some saving functionality
window.onbeforeunload = function() { return true; };