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