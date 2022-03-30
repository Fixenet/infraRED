// use this file to define the menu bar
infraRED.editor.menu = (function() {
    let menuBar;

    return {
        init: function() {
            console.log("Creating Menu Bar...");

            menuBar = $("#infraRED-ui-menu-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Menu";
        
            menuBar.append(title);
        },
        get: function() {
            return menuBar;
        },
    };
})();