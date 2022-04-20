// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;
    
    let tabList = {};
    function createTab(categoryName) {
        let newTab = $("<div>", {
            id: categoryName.toLowerCase() + "-tab",
            class: "tab",
        });

        newTab.append($("<div>", {
            id: categoryName.toLowerCase() + "-title",
            class: "title",
            text: categoryName,
        }));

        tabList[categoryName] = newTab;
        return newTab;
    }

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

            let nodesTab = createTab("Nodes");
            infraRED.loader.importNodes().forEach(node => {
                nodesTab.append(node.getDiv());
            });
            tabs.append(nodesTab);

            content.append(tabs);
            resourceBar.append(content);
        },
        get: function() {
            return resourceBar;
        },
    };
})();