infraRED.settings = (function() {
    nodes = (function() {
        return {
            MAX_ID: 10000,
            EMPTY_NAME: "No Name Node",
        };
    })();

    capabilities = (function() {
        return {
        };
    })();

    requirements = (function() {
        return {
        };
    })();

    relationships = (function() {
        return {
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