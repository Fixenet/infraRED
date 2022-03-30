// use this file to define the resource bar
infraRED.editor.resource = (function() {
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

    function loadNodeTypes() {
        let nodeTypes = importNodeTypesFromJSON();
        let importedNodes = [];
        for (let type in nodeTypes) {
            let node = infraRED.nodes.create(type);
            
            const capabilities = nodeTypes[type].capabilities;
            const requirements = nodeTypes[type].requirements;
        
            if (capabilities) node.addCapabilities(nodeTypes[type].capabilities);
            if (requirements) node.addRequirements(nodeTypes[type].requirements);
        
            importedNodes.push(node);
        
            console.log("Loaded: " + type);
        }
        return importedNodes;
    }

    return {
        init: function() {
            console.log("Creating Resource Bar...");

            resourceBar = $("#infraRED-ui-resource-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Resource";
        
            resourceBar.append(title);

            let content = document.createElement("div");
            content.className = "content";

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