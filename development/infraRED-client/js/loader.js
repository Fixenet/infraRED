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
        for (let type in types) {
            //create a resource node
            let newNode = infraRED.nodes.new(type);

            //initialize category - used by category.js to implement category tabs
            newNode.category = types[type].category;

            //initialize properties - alter functionality of a node
            newNode.properties = types[type].properties;

            //initialize capabilities
            for (let capability in types[type].capabilities) {
                newNode.addCapability(capability);
            }
            //initialize requirements
            for (let requirement in types[type].requirements) {
                newNode.addRequirement(requirement);
            }
            
        }
    }

    return {
        loadNodes: loadNodesFromServerRegistry,
        getNodes: getNodesFromServerRegistry,
    };
})();