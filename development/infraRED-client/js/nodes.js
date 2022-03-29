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