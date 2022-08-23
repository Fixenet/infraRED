infraRED.loader = (function() {
    function getNodesFromServerRegistry() {
        let types;
        $.ajax({
            url: '/listNodes',
            dataType: 'json',
            async: false,

            success: function(data) {
                types = data;
            }
        });
        if (typeof(types) !== 'object') {
            throw "Couldn't fetch node list.";
        }
        return types;
    }

    function loadNodesFromServerRegistry() {
        let types = getNodesFromServerRegistry();
        for (let typeName in types) {
            //create a resource node
            let type = types[typeName];
            let newNode = infraRED.nodes.new(typeName);

            //initialize category - used by category.js to implement category tabs
            newNode.category = type.category;

            //initialize properties - alter functionality of a node
            newNode.properties = type.properties;
            newNode.properties.name = infraRED.settings.nodes.EMPTY_NAME;

            //initialize capabilities
            for (let capabilityName in type.capabilities) {
                newNode.addCapability(capabilityName, type.capabilities[capabilityName]);
            }
            //initialize requirements
            for (let requirementName in type.requirements) {
                newNode.addRequirement(requirementName, type.requirements[requirementName]);
            }
        }
    }

    return {
        loadNodes: loadNodesFromServerRegistry,
        getNodes: getNodesFromServerRegistry,
    };
})();