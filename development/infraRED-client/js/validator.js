infraRED.validator = (function() {
    return {
        init: function() {
            console.log('Starting the validator functionality.');
        },

        //validate node type
        validateNodeMode: function(nodeMode) {
            return typeof(nodeMode) === 'string' && (nodeMode === 'capability' || nodeMode === 'requirement');
        },
        //better validation will be done to ensure proper regex rules
        validateNodeType: function(nodeType) {
            return typeof(nodeType) === 'string';
        },
        validateRelationshipType: function(relationshipType) {
            return typeof(relationshipType) === 'string';
        },
    };
})();