infraRED.nodes = (function() {
    const MAX_ID = 10000;
    //TODO - MAJOR REFACTOR
    //organize all of the structure, clearly define how elements will be defined
    //so there is organization between this node class and the divs on the browser
    let currentID = 0;
    class Node {
        constructor(type) {
            //TODO - for now this ID is appended to the nodes in the resource list but on the canvas
            //as it is, we will be duplicating IDs on the canvas
            this.resourceID = -1;
            this.canvasID = -1;

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

        addCapability(capability) {
            this.capabilities[capability] = {};
        }

        addRequirement(requirement) {
            this.requirements[requirement] = {};
        }

        getDiv() {
            let div = document.createElement("div");
            div.className = "node resource-node";
            div.id = this.resourceID;

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

    // this list holds information about the node types loaded into infraRED
    resourceNodesList = (function() {
        let nodeList = {};

        function addNode(node) {
            nodeList[node.resourceID] = node;
        }

        function getNodeByID(id) {
            return nodeList[id];
        }

        function getNodeList() {
            return nodeList;
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

        function getNodeList() {
            return nodeList;
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
        infraRED.editor.status.log(JSON.stringify(resourceNodesList.getAll()));
        console.log(resourceNodesList.getAll());
    }

    function logCanvasList() {
        console.log("Logging canvas list...");
        infraRED.editor.status.log(JSON.stringify(canvasNodesList.getAll()));
        console.log(canvasNodesList.getAll());
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