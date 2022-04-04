// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;

    //TODO - i may not want to have file handling behaviour on a supposed JS DOM manipulation only file
    function importNodeTypesFromJSON() {
        let nodeTypes;
        $.ajax({
            url: '/nodes.json',
            dataType: 'json',
            async: false,

            //success function places value inside the return variable
            success: function(data) {
                nodeTypes = data;
                console.log("Importing node types...");
            }
        });
        return nodeTypes;
    }

    //TOOD - this should not be here, it is backend, move it outside UI folder
    function loadNodeTypes() {
        let nodeTypes = importNodeTypesFromJSON();
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

    return {
        init: function() {
            console.log("Creating Resource Bar...");

            resourceBar = $("#infraRED-ui-resource-bar");

            let title = $("<div>", {
                id: "resource-bar-title",
                class: "title",
                text: "Resource",
            });
            resourceBar.append(title);

            let content = $("<div>", {
                id: "resource-bar-content",
                class: "content",
            });

            loadNodeTypes().forEach(node => {
                content.append(node.getDiv());
            });

            resourceBar.append(content);
        },
        get: function() {
            return resourceBar;
        },
    };
})();