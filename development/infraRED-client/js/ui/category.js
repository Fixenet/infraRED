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
        },
        get: function() {
            return categoryBar;
        },
    };
})();