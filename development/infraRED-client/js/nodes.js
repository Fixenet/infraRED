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