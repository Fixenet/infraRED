// use this file to define the category bar
infraRED.editor.category = (function() {
    let categoryBar;

    return {
        init: function() {
            console.log("Creating Category Bar...");

            categoryBar = $("#infraRED-ui-category-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Category";
        
            categoryBar.append(title);

            let content = document.createElement("div");
            content.className = "content";

            categoryBar.append(content);
        },
        get: function() {
            return categoryBar;
        },
    };
})();