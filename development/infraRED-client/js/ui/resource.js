// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;

    let nodeTab, relationshipTab;

    return {
        init: function() {
            console.log("%cCreating Resource Bar...", "color: #c2ff9f");

            resourceBar = $("#infraRED-ui-resource-bar");

            let content = $("<div>", {
                id: "resource-bar-content",
                class: "content",
            });

            let tabs = $("<div>", {
                id: "resource-tabs",
            });

            nodeTab = $("<div>", {
                id: "node-tab",
                class: "tab",
            });

            nodeTab.append($("<div>", {
                id: "node-title",
                class: "title",
                text: "Nodes",
            }));

            infraRED.loader.importNodes().forEach(node => {
                nodeTab.append(node.getDiv());
            });

            tabs.append(nodeTab);

            relationshipTab = $("<div>", {
                id: "relationship-tab",
                class: "tab",
            });

            relationshipTab.append($("<div>", {
                id: "relationship-title",
                class: "title",
                text: "Relationships",
            }));

            infraRED.loader.importRelationships().forEach(relationship => {
                relationshipTab.append(relationship.getDiv());
            });

            tabs.append(relationshipTab);
            relationshipTab.hide();

            content.append(tabs);
            resourceBar.append(content);
        },
        get: function() {
            return resourceBar;
        },
        toggleNodesTab: function() {
            nodeTab.toggle();
        },
        toggleRelationshipsTab: function() {
            relationshipTab.toggle();
        }
    };
})();