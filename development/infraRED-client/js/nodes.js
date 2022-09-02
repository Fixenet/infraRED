infraRED.nodes = (function() {
    /**
     * @global Holds information about the current node being dragged
     */
    let canvasSelectedDragNode = null;

    function createProperty(type, name, value) {
        let property = $('<div>', {
            id: `${name}`,
            class: 'property',
        });
        property.attr('type', type);

        let propertyName = $('<div>', {
            class: 'property-name',
            text: name,
        });

        let propertyValue = $('<input>', {
            class: 'property-value',
            placeholder: value,
        });

        property.append(propertyName);
        property.append(propertyValue);

        return property;
    }
    
    /**
     * @class Creates a connectable.
     * @param {string} mode capability / requirement
     * @param {string} type name of the functionality being served/received
     * @param {number} nodeID the canvas ID of this connectable's node
     * @classdesc Represents a capability or requirement of a Node, 
     * a possible functionality that can be served/received to/from another Node.
     * These have no ID since the type is a unique identifier in each respective Node object.
     */
    class Connectable {
        constructor(mode, type, nodeID) {
            //select between requirement and capability connectable
            if (infraRED.validator.validateNodeMode(mode)) this.mode = mode;

            //type of the connectable
            this.type = type;

            //data for this connectable
            this.properties = {};

            //nodeID on the canvas of the parent node to this connectable
            this.nodeID = nodeID;
        }

        getDiv() {
            let connectable = $('<div>', {
                id: this.type,
                class: 'connectable ' + this.mode,
                text: this.type,
            });

            connectable.attr({
                name: this.properties.name,
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
                id: this.type,
                name: this.properties.name,
                type: this.type,
            });

            let background = connectable.rect(connectable.width, connectable.height).move(0,0);

            //write the type of this connectable
            connectable.plain(this.type).move(0,0).cx(connectable.width/2);

            connectable.on('click', (event) => {
                event.stopPropagation();
                //handles logic and svg drawing
                infraRED.events.emit('canvas:create-connection', this, background);
            });

            return connectable;
        }

        getPropertiesModalSection(propertyList) {
            let propertyContainer = $('<div>', {
                class: `${this.mode} property-list`,
            });

            let type = $('<div>', {
                class: `connectable-name`,
                text: this.type,
            });
            propertyContainer.append(type);

            //every property has the form of 'NAME - VALUE', you can't change NAME, only VALUE
            for (let propertyID in this.properties) {
                let propertyDiv = createProperty(this.mode, propertyID, this.properties[propertyID]);
                propertyDiv.attr('connectable-name', this.type);
                propertyContainer.append(propertyDiv);
                propertyList.push(propertyDiv);
            }

            return propertyContainer;
        }

        updateSVG() {
            $(`g.${this.mode}#${this.type} text`).text(this.properties.name !== infraRED.settings.connectables.EMPTY_NAME ? this.properties.name : this.type);
        }

        print() {
            let printResult = `${this.mode} - ${this.type}`;
            return printResult;
        }
    }

    /**
     * @class Creates a node.
     * @param {string} type type of infrastructure
     * @classdesc Represents any piece of physical/virtual infrastructure.
     */
    class Node {
        constructor(type) {
            this.resourceID = null;
            this.canvasID = null;
            
            this.type = type;

            //pattern functionality
            this.isPattern = false;
            this.patternMemory = null;

            this.properties = {};

            this.capabilities = {};
            this.requirements = {};

            this.relationships = [];
        }

        setName(name) {
            if (infraRED.validator.validateNodeType(name)) {
                this.properties.name = name;
            } else {
                console.log('Incorrect Node name was given.');
            }
        }

        makePatternNode(patternComposition) {
            //pattern functionality
            this.isPattern = true;
            this.patternMemory = patternComposition;
        }

        addCapability(capabilityType, properties) {
            //index by type since only one of each type exists in each Node
            let capability = new Connectable('capability', capabilityType, this.canvasID);
            capability.properties = properties;
            capability.properties.name = infraRED.settings.connectables.EMPTY_NAME;
            this.capabilities[capabilityType] = capability;
        }

        addRequirement(requirementType, properties) {
            //index by type since only one of each type exists in each Node
            let requirement = new Connectable('requirement', requirementType, this.canvasID);
            requirement.properties = properties;
            requirement.properties.name = infraRED.settings.connectables.EMPTY_NAME;
            this.requirements[requirementType] = requirement;
        }

        addRelationship(relationship) {
            this.relationships.push(relationship);
        }

        getPropertiesModal() {
            let content = $('<div>', {
                id: this.canvasID,
                class: 'modal-content',
            });

            let deleteButton = $('<div>', {
                class: 'button delete-button',
                text: 'Delete',
            });

            let saveButton = $('<div>', {
                class: 'button save-button',
                text: 'Save',
            });

            let closeButton = $('<span>', {
                class: 'button close-button',
                text: 'X',
            });

            function closeModal() {
                content.remove();
                $('.modal').css('display', 'none');
            }

            deleteButton.on('click', (event) => {
                //close modal
                closeModal();

                removeNodeFromCanvas(this.canvasID);
            });

            saveButton.on('click', (event) => {
                //save values inside input boxes
                propertyList.forEach((propertyDiv) => {
                    //TODO property divs need to be based on a more identifying property, canvasID + type
                    let type = $(propertyDiv).attr('type');
                    let name = $(propertyDiv).children('.property-name').text();
                    let value = $(propertyDiv).children('.property-value').val();

                    //don't change values if they are null
                    if (value !== '') {
                        switch(type) {
                            case 'properties':
                                this.properties[name] = value; 
                                break;
                            case 'capability':
                                let capability = $(propertyDiv).attr('connectable-name');
                                this.capabilities[capability].properties[name] = value;
                                break;
                            case 'requirement':
                                let requirement = $(propertyDiv).attr('connectable-name');
                                this.requirements[requirement].properties[name] = value;
                                break;
                        }
                    }
                });

                this.updateSVG();
                closeModal();
            });

            closeButton.on('click', (event) => {
                closeModal();
            });

            content.append(closeButton);
            content.append(deleteButton);
            content.append(saveButton);

            let type = $('<div>', {
                class: 'node-type button',
                text: `Node Type: ${this.type}`,
            });
            content.append(type);
            
            let propertyList = [];
            let propertyContainer = $('<div>', {
                class: 'property-list',
                text: 'Node Properties'
            });

            //every property has the form of 'NAME - VALUE', you can't change NAME, only VALUE
            for (let propertyID in this.properties) {
                let propertyDiv = createProperty('properties', propertyID, this.properties[propertyID]);
                propertyContainer.append(propertyDiv);
                propertyList.push(propertyDiv);
            }

            for (let requirement of Object.values(this.requirements)) {
                let requirementDiv = requirement.getPropertiesModalSection(propertyList);
                propertyContainer.append(requirementDiv);
            }

            for (let capability of Object.values(this.capabilities)) {
                let capabilityDiv = capability.getPropertiesModalSection(propertyList);
                propertyContainer.append(capabilityDiv);
            }

            content.append(propertyContainer);
            return content;
        }

        getDiv() {
            let div = $('<div>', {
                id: this.resourceID,
                class: 'resource node resource-node',
            });

            if (this.isPattern) {
                let loadButton = $('<span>', {
                    class: 'button load-button',
                    text: 'Load',
                });
                loadButton.on('click', (event) => {
                    console.log('Load.');
                });
                div.append(loadButton);

                let deleteButton = $('<span>', {
                    class: 'button delete-button',
                    text: 'Delete',
                });
                deleteButton.on('click', (event) => {
                    div.remove();
                    resourceNodesList.remove(this);
                });
                div.append(deleteButton);
            }

            let typeDiv = $('<div>', { 
                class: 'type', 
                text: this.type,
            });

            if(this.isPattern) typeDiv.css('margin-top', '25px');
            
            div.append(typeDiv);

            if (!$.isEmptyObject(this.requirements)) {
                let requirements = $('<div>', {
                    class: 'requirements',
                });

                Object.values(this.requirements).forEach(requirement => {
                    requirements.append(requirement.getDiv());
                });

                //add a border line to separate capabilities from requirements if both exist
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
            node.attr('id', this.canvasID);
            node.width = 200;

            let background = node.rect().radius(10).addClass('background');

            let type = node.group().addClass('type');
            type.height = 20;
            //adds the type background
            let typeBackground = type.rect().radius(10).move(10, 7);
            //adds the type text
            let typeText = type.plain(this.type); //starts at type since it has no name

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

                //add a border line to separate capabilities from requirements if both exist
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

            //double click opens a modal
            node.on('dblclick', (event) => {
                let modal = $('.modal');
                modal.css('display', 'block');
                modal.append(this.getPropertiesModal());
            });

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

        updateSVG() {
            $(`g.canvas-node#${this.canvasID} g.type text`).text(this.properties.name !== infraRED.settings.nodes.EMPTY_NAME ? this.properties.name : this.type);
            for (let capability of Object.values(this.capabilities)) {
                capability.updateSVG();
            }
            for (let requirement of Object.values(this.requirements)) {
                requirement.updateSVG();
            }
        }

        print() {
            //this node is only present in the resource bar
            let printResult = `ResourceID ${this.resourceID}: ${this.type}`;
            if (this.canvasID != null) { //this node also exists in the canvas
                printResult += `\nCanvasID ${this.canvasID}: ${this.properties.name}`;
            } else {
                printResult += `\n${JSON.stringify(this.properties)}`;
            }
            return printResult;
        }
    }

    let currentID = 0;
    //this list holds information about the node types loaded into infraRED
    resourceNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            node.resourceID = currentID++;
            nodeList[node.resourceID] = node;
        }

        function removeNode(node) {
            delete nodeList[node.resourceID];
        }

        function getNodeByIdentifier(id) {
            return nodeList[id];
        }

        //returns an array with the node class instances
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

    //this list holds information about the nodes in play
    //these nodes will be different from the nodes present in the resource bar
    //for that distinction, resource nodes will have sequential IDs
    //and canvas nodes will have the random IDs
    canvasNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            nodeList[node.canvasID] = node;
        }

        function removeNode(node) {
            //remove all of this node's relationships from memory
            for (let relationshipIndex in node.relationships) {
                let relationship = node.relationships[relationshipIndex];
                //delete SVG elem from the canvas
                relationship.lineSVG.remove();
                //delete relationship from both nodes
                let otherNode;
                if (relationship.capability.nodeID === node.canvasID) {
                    otherNode = getNodeByIdentifier(relationship.requirement.nodeID);
                } else if (relationship.requirement.nodeID === node.canvasID) {
                    otherNode = getNodeByIdentifier(relationship.capability.nodeID);
                }
                for (let otherRelationshipIndex in otherNode.relationships) {
                    let otherRelationship = otherNode.relationships[otherRelationshipIndex];
                    if (relationship.canvasID === otherRelationship.canvasID) {
                        //remove elem from array
                        otherNode.relationships.splice(otherRelationshipIndex--, 1);
                    }
                }
                //delete from the relationships code memory
                infraRED.relationships.remove(relationship);
            }
            delete nodeList[node.canvasID];
        }

        function getNodeByIdentifier(id) {
            return nodeList[id];
        }

        //returns an array with the node class instances
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
            console.log(node);
            logString.push(node.print());
        });

        logString = logString.join('\n');
        infraRED.editor.statusBar.log(logString);
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
    }

    /**
     * This method dictates the full logic when adding a new resource type
     * @param {string} type the type of the new node
     * @returns {Node} a resource node without its connectables yet, these are added later via its own methods
     */
    function newResourceNode(type) {
        let newNode = new Node(type);
        resourceNodesList.add(newNode);
        infraRED.events.emit('nodes:add-resources', newNode);
        return newNode;
    }

    /**
     * This method dictates the full logic when adding a node to the canvas.
     * @param {Node} resourceNode the node that came from the resource list
     * @return {string|Node} a canvas node if the canvas has space for a node, 'full canvas' if not
     */
    function moveNodeToCanvas(resourceNode) {
        //stop the node from entering the canvas if we are at max value
        if (canvasNodesList.getAll().length == infraRED.settings.nodes.MAX_ID) {
            infraRED.events.emit('nodes:max-nodes-in-canvas');
            return 'full canvas';
        }

        let canvasNode = new Node(resourceNode.type);
        canvasNode.resourceID = resourceNode.resourceID;
        canvasNode.canvasID = createCanvasID();

        canvasNode.isPattern = resourceNode.isPattern;
        canvasNode.patternMemory = $.extend(true, {}, resourceNode.patternMemory);
        canvasNode.properties = $.extend(true, {}, resourceNode.properties);

        for (let capability of Object.values(resourceNode.capabilities)) canvasNode.addCapability(capability.type, $.extend(true, {}, capability.properties));
        for (let requirement of Object.values(resourceNode.requirements)) canvasNode.addRequirement(requirement.type, $.extend(true, {}, requirement.properties));

        canvasNodesList.add(canvasNode);
        infraRED.events.emit('nodes:move-to-canvas', canvasNode);

        return canvasNode;
    }

    function removeNodeFromCanvas(canvasID) {
        //remove SVG element
        $(`.canvas-node#${canvasID}`).remove();

        //remove logic element
        let deleteNode = canvasNodesList.getByID(canvasID);
        canvasNodesList.remove(deleteNode);
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