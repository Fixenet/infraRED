// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

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
                class: "category",
                alt: "Node Category",
                src: "./icons/computer-svgrepo-com.svg",
            });

            nodeCategory.on("click", () => {
                infraRED.editor.statusBar.log("Nodes!");
            });

            let relationshipCategory = $("<img>", {
                id: "relationship-category",
                class: "category",
                alt: "Relationship Category",
                src: "./icons/arrow-svgrepo-com.svg",
            });

            relationshipCategory.on("click", () => {
                infraRED.editor.statusBar.log("Relationships!");
            });

            content.append(nodeCategory);
            content.append(relationshipCategory);
        },
        get: function() {
            return categoryBar;
        },
    };
})();