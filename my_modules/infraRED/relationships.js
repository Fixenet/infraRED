infraRED.nodes.relationships = (function() {
    registry = (function() {
        let relationshipTypes = [];

        /**
         * Adds the relationship type to the registry
         * @param {Relationship} relationship 
         */
        function addRelationshipType(relationship) {
            relationshipTypes.push(relationship.type);
        }

        return {
            addType: addRelationshipType,  
        };
    })();

    allRelationshipsList = (function() {
        let relationships = {};

        function addRelationship(relationship) {
            registry.addType(relationship);
            relationships[relationship.id] = relationship;
        }

        function getRelationshipByID(id) {
            return relationships[id];
        }

        return {
          addRelationship: addRelationship,
          getRelationshipByID: getRelationshipByID,
          has: function(relationship) {
              relationships.hasOwnProperty(relationship);
          }
        };
    })();

    function addRelationship(relationship) {
        allRelationshipsList.addRelationship(relationship);
        infraRED.events.emit("relationships:add", relationship);
        return relationship;
    }

    function relationshipExists(relationship) {
        console.log("Checking if exists: " + JSON.stringify(relationship));
        return allRelationshipsList.has(relationship);
    }
    
    return {
        init: function() {
            console.log("Starting the relationships functionality.");
        },

        add: addRelationship,
        has: relationshipExists,
    };
})();