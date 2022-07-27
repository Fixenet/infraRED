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
        console.log(types);
        for (let type in types) {
            let newNode = infraRED.nodes.new(type);
            for (let capability in types[type].capabilities) {
                newNode.addCapability(capability);
            }
            for (let requirement in types[type].requirements) {
                newNode.addRequirement(requirement);
            }
            newNode.properties.category = types[type].category;
        }
    }

    return {
        loadNodes: loadNodesFromServerRegistry,
        getNodes: getNodesFromServerRegistry,
    };
})();