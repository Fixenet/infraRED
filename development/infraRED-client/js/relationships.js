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

        //returns an array with the relationship class instances
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
    }

    function setUpEvents() {
        infraRED.events.on('relationships:log-all', logRelationshipList);
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