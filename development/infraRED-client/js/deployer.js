infraRED.deployer = (function () {
    function cleanUpCanvasList(buildingPattern) {
        //TODO - deepcopy of my node obj list, can probably be done better
        //i can also use this to only pass up to the server the values i want (reduce clutter)
        let cleanNodeList = [];
        for (let node of infraRED.nodes.canvasList.getAll()) {
            //pattern within pattern catcher
            if (buildingPattern && node.isPattern) throw new Error('Patterns cannot have patterns inside. At least for now :)');
            let cleanNode = $.extend(true, {}, node);
            
            let cleanList = [];
            for (let relationship of cleanNode.relationships) {
                let clean = $.extend(true, {}, relationship);
                //delete clean.lineSVG;
                clean.lineSVG = clean.lineSVG.svg();
                //delete clean.lineOffsetPlot;
                cleanList.push(clean);
            }

            cleanNode.relationships = cleanList;
            cleanNodeList.push(cleanNode);
        }
        return cleanNodeList;
    }

    function deployNodes() {
        //post the current nodes in use to server to start deployment
        $.ajax({
            method: 'POST', url: '/deploy',
            contentType: 'application/json', dataType: 'json',
            async: false,

            data: JSON.stringify({
                'nodes': cleanUpCanvasList(false),
            }),

            //TEST - we get the data back from the server
            success: function(data) {
                console.log(data);
            }
        });
    }

    function buildPatternNode(patternName, patternComposition) {
        let patternNode = infraRED.nodes.new(patternName);
        //this gives me JSON string with info about every node of a pattern
        patternNode.makePatternNode(patternComposition);

        let N = Object.values(patternComposition).length;
        //requirements from the nodes at level 0
        for (let level0Node of patternComposition[0]) {
            for (let requirementName in level0Node.requirements) {
                let requirement = level0Node.requirements[requirementName];
                patternNode.addRequirement(requirementName, $.extend(true, {}, requirement.properties));
            } 
        }
        //capabilities from the nodes at level N (highest level)
        for (let levelNNode of patternComposition[N-1]) {
            for (let capabilityName in levelNNode.capabilities) {
                let capability = levelNNode.capabilities[capabilityName];
                patternNode.addCapability(capabilityName, $.extend(true, {}, capability.properties));
            } 
        }

        infraRED.editor.resourceBar.newSavedPattern(patternNode);
        return patternNode;
    }

    function saveNodes() {
        try {
            let patternName = prompt("Please enter pattern name:", "Default Pattern Name");
            if (patternName == null) throw new Error('Pattern has empty name.');
            //post the current nodes in use to server to start deployment
            let patternComposition = cleanUpCanvasList(true);
            $.ajax({
                method: 'POST', url: '/save',
                contentType: 'application/json', dataType: 'json',
                async: false,

                data: JSON.stringify({
                    'name': patternName,
                    'nodes': patternComposition,
                }),

                //TEST - we get the data back from the server
                success: function(orderedNodes) {
                    buildPatternNode(patternName, orderedNodes);
                }
            });
        } catch(error) {
            console.error(error);
        }
    }

    function destroyNodes() {
        $.ajax({
            method: 'GET', url: '/destroy',
            contentType: 'application/json', dataType: 'json',
            async: false,

            //TEST - we get the data back from the server
            success: function(data) {
                console.log(data);
            }
        });
    }

    return {
        init: function() {
            console.log('Starting the deployment functionality.');

            infraRED.events.on('relationships:deploy', deployNodes);
            infraRED.events.on('relationships:save', saveNodes);
            infraRED.events.on('relationships:destroy', destroyNodes);
        }
    };
})();