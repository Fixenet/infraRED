infraRED.loader = (function() {
    function importTypesFromJSON(url) {
        let types;
        $.ajax({
            url: url,
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                types = data;
                console.log(`Importing types from ${url}...`);
            }
        });
        return types;
    }

    function loadNodeTypes() {
        let nodeTypes = importTypesFromJSON("nodes.json");
        let importedNodes = [];
        for (let type in nodeTypes) {
            let node = infraRED.nodes.new(type);
            
            const capabilities = nodeTypes[type].capabilities;
            const requirements = nodeTypes[type].requirements;
        
            if (capabilities) for(let capability in capabilities) {
                node.addCapability(capabilities[capability]);
            }
            if (requirements) for(let requirement in requirements) {
                node.addRequirement(requirements[requirement]);
            }
        
            importedNodes.push(node);
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    function loadRelationshipTypes() {
        let relationshipTypes = importTypesFromJSON("relationships.json");
        let importedRelationships = [];
        for (let type in relationshipTypes) {
            let relationship = infraRED.relationships.new(type);

            importedRelationships.push(relationship);

            console.log("Loaded: " + type);
        }
        return importedRelationships;
    }

    return {
        importNodes: loadNodeTypes,
        importRelationships: loadRelationshipTypes,
    };
})();