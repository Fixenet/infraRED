infraRED.settings = (function() {
    nodes = (function() {
        return {
            MAX_ID: 3,
            EMPTY_NAME: "No Name Node",
        };
    })();

    capabilities = (function() {
        return {
            EMPTY_NAME: "No Name Capability",
        };
    })();

    requirements = (function() {
        return {
            EMPTY_NAME: "No Name Requirement",
        };
    })();

    relationships = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: "No Name Relationship",
        };
    })();

    return {
        capabilities: capabilities,
        requirements: requirements,
        nodes: nodes,
        relationships: relationships,
    };
})();