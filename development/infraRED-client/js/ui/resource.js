// use this file to define the resource bar
infraRED.editor.resourceBar = (function() {
    let resourceBar;
    
    function createTab(categoryName) {
        let newTab = $('<div>', {
            id: categoryName.toLowerCase() + '-tab',
            class: 'tab',
        });

        newTab.append($('<div>', {
            id: categoryName.toLowerCase() + '-title',
            class: 'title',
            text: categoryName,
        }));

        newTab.hide();
        return newTab;
    }

    let tabList = {};
    function changeTabs(fromTab, toTab) {
        if (fromTab != null) tabList[fromTab].hide();
        tabList[toTab].show();
    }

    return {
        init: function() {
            console.log('%cCreating Resource Bar...', 'color: #c2ff9f');

            resourceBar = $('#infraRED-ui-resource-bar');

            let content = $('<div>', {
                id: 'resource-bar-content',
                class: 'content',
            });

            let tabs = $('<div>', {
                id: 'resource-tabs',
            });

            let nodesList = infraRED.nodes.resourceList.getAll();

            for (let node of nodesList) {
                let category = node.properties.category.name;
                if (tabList[category] == null) {
                    tabList[category] = createTab(category);
                    tabs.append(tabList[category]);
                } 
                tabList[category].append(node.getDiv());
            }

            content.append(tabs);
            resourceBar.append(content);

            infraRED.events.on('category:change-category', changeTabs);
        },
        get: function() {
            return resourceBar;
        },
    };
})();