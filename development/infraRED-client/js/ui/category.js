// use this file to define the category bar
infraRED.editor.categoryBar = (function() {
    let categoryBar;

    return {
        init: function() {
            console.log("Creating Category Bar...");

            categoryBar = $("#infraRED-ui-category-bar");

            let content = $("<div>", {
                id: "category-bar-content",
                class: "content",
            });
            categoryBar.append(content);
        },
        get: function() {
            return categoryBar;
        },
    };
})();