infraRED.loader = (function() {
    function importNodesFromJSLibrary() {
        console.log("Don't break charm.");

        let types;
        //TODO get node list from server
        $.ajax({
            url: "/nodes",
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                types = data;
                console.log("Found nodes.");
            }
        });

        //TODO download all the corresponding scripts
        console.log(types);

        //TODO go into the API${types[0]} and when i get this i send the files
        $.getScript(`/nodes/compute.js`, function() {
            let comp = new Compute();
            console.log(comp.capabilties);
        });
    }

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
        
            if (capabilities) for (let capability in capabilities) {
                node.addCapability(capabilities[capability]);
            }
            if (requirements) for (let requirement in requirements) {
                node.addRequirement(requirements[requirement]);
            }
        
            importedNodes.push(node);
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    return {
        importNodes: loadNodeTypes,
        testImport: importNodesFromJSLibrary,
    };
})();