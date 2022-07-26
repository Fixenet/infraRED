infraRED.loader = (function() {
    function importNodesFromJSLibrary() {
        let types;
        $.ajax({
            url: "/listNodes",
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                types = data;
            }
        });

        console.log(types);

        let nodeList = [];
        for (let type in types) {
            let newNode = infraRED.nodes.new(type);

            for (let capability in types[type].capabilities) {
                newNode.addCapability(capability);
            }

            for (let requirement in types[type].requirements) {
                newNode.addRequirement(requirement);
            }

            nodeList.push(newNode);
        }
        return nodeList;
    }

    return {
        importNodes: importNodesFromJSLibrary,
    };
})();