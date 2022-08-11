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