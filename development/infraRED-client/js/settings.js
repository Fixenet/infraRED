infraRED.settings = (function() {
    canvas = (function() {
        return {
            canvasSizeW: 2000,
            canvasSizeH: 2000,
            gridSizeGap: 20,
            SVGnamespace: 'http://www.w3.org/2000/svg',
        };
    })();

    nodes = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: 'No Name Node',
        };
    })();

    capabilities = (function() {
        return {
            EMPTY_NAME: 'No Name Capability',
        };
    })();

    requirements = (function() {
        return {
            EMPTY_NAME: 'No Name Requirement',
        };
    })();

    relationships = (function() {
        return {
            MAX_ID: 100,
            EMPTY_NAME: 'No Name Relationship',
        };
    })();

    return {
        canvas: canvas,
        capabilities: capabilities,
        requirements: requirements,
        nodes: nodes,
        relationships: relationships,
    };
})();