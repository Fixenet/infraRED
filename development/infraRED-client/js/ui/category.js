// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

    let selectedCategory;
    function toggleCategory(category) {
        if (selectedCategory == category) {
            return false;
        } else {
            selectedCategory.toggleClass("category-selected");
            selectedCategory = category;
            category.toggleClass("category-selected");
            return true;
        }
    }

    return {
        init: function() {
            console.log("%cCreating Category Bar...", "color: #fd9694");

            categoryBar = $("#infraRED-ui-category-bar");

            let content = $("<div>", {
                id: "category-bar-content",
                class: "content",
            });
            categoryBar.append(content);

            let nodeCategory = $("<img>", {
                id: "node-category",
                class: "category category-selected",
                alt: "Node Category",
                src: "./icons/computer-svgrepo-com.svg",
            });

            nodeCategory.on("click", () => {
                if (toggleCategory(nodeCategory)) {
                    infraRED.editor.statusBar.log("Nodes!");
                    infraRED.editor.resourceBar.toggleNodesTab();
                    infraRED.editor.resourceBar.toggleRelationshipsTab();
                }
            });

            selectedCategory = nodeCategory;

            let relationshipCategory = $("<img>", {
                id: "relationship-category",
                class: "category",
                alt: "Relationship Category",
                src: "./icons/arrow-svgrepo-com.svg",
            });

            relationshipCategory.on("click", () => {
                if (toggleCategory(relationshipCategory)) {
                    infraRED.editor.statusBar.log("Relationships!");
                    infraRED.editor.resourceBar.toggleRelationshipsTab();
                    infraRED.editor.resourceBar.toggleNodesTab();
                }
            });

            content.append(nodeCategory);
            content.append(relationshipCategory);
        },
        get: function() {
            return categoryBar;
        },
    };
})();