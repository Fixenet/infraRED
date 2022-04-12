infraRED.relationships = (function() {
    const MAX_ID = 10000;
    const EMPTY_NAME_RELATIONSHIP = "EMPTY_NAME_NODE";

    let currentID = 0;
    class Relationship {
        constructor(type) {
            this.resourceID = -1;
            this.canvasID = -1;

            this.name = EMPTY_NAME_RELATIONSHIP;

            this.type = type;
            this.properties = [];
        }

        changeName(name) {
            if (infraRED.validator.validateRelationshipType(name)) {
                //Add the type to the relationship object
                this.name = name;
            } else {
                console.log("Incorrect Relationship Name was given.");
            }
        }

        getDiv() {
            let div = $("<div>", {
                id: this.resourceID,
                class: "resource relationship resource-relationship",
            });

            div.append($("<p>", { 
                class: "type", 
                text: this.type,
            }));
            
            return div;
        }
    }

    // this list holds information about the node types loaded into infraRED
    resourceRelationshipList = (function() {
        let relationshipList = {};

        function addRelationship(relationship) {
            relationshipList[relationship.resourceID] = relationship;
        }

        function getRelationshipByID(id) {
            return relationshipList[id];
        }

        // returns an array with the node class instances
        function getRelationshipList() {
            return Object.values(relationshipList);
        }

        return {
          add: addRelationship,
          getByID: getRelationshipByID,
          getAll: getRelationshipList,
        };
    })();

    // this list holds information about the nodes in play
    // these nodes will be different from the nodes present in the resource bar
    // for that distinction, resource nodes will have sequential IDs
    // and canvas nodes will have the random IDs
    canvasRelationshipList = (function() {
        let relationshipList = {};

        function addRelationship(relationship) {
            relationship.canvasID = createID();
            relationshipList[relationship.canvasID] = relationship;
        }

        function removeRelationship(relationship) {
            delete relationshipList[relationship.canvasID];
        }

        function getRelationshipByID(id) {
            return relationshipList[id];
        }

        // returns an array with the node class instances
        function getRelationshipList() {
            return Object.values(relationshipList);
        }

        return {
          add: addRelationship,
          remove: removeRelationship,
          getByID: getRelationshipByID,
          getAll: getRelationshipList,
        };
    })();

    function newResourceRelationship(type) {
        let relationship = new Relationship(type);
        relationship.resourceID = currentID++;

        resourceRelationshipList.add(relationship);

        infraRED.events.emit("relationship:add-resources", relationship);

        return relationship;
    }

    function moveRelationshipToCanvas(resourceRelationship) {
        let canvasRelationship = new Relationship(resourceRelationship.type);

        canvasRelationship.resourceID = resourceRelationship.resourceID;
        canvasRelationship.canvasID = createID();

        canvasNodesList.add(canvasRelationship);

        infraRED.events.emit("relationship:move-to-canvas", canvasRelationship);

        return canvasRelationship;
    }

    function removeRelationshipFromCanvas(canvasRelationship) {
        canvasRelationshipList.remove(canvasRelationship);
    }

    function createID() {
        function generateID() {
            return Math.floor(Math.random() * MAX_ID);
        }

        let newID = generateID();

        while (canvasRelationshipList.getByID(newID) != undefined) newID = generateID();

        return newID;
    }
    
    return {
        init: function() {
            console.log("Starting the relationships functionality.");
        },
        new: newResourceRelationship,
        add: moveRelationshipToCanvas,
        remove: removeRelationshipFromCanvas,

        resourceList: resourceRelationshipList,
        canvasList: canvasRelationshipList,
    };
})();