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

            let content = document.createElement("div");
            content.className = "content";

            menuBar.append(content);

            let logCanvasButton = document.createElement("button");
            let logResourcesButton = document.createElement("button");

            logCanvasButton.className = "menu-button";
            logCanvasButton.id = "log-canvas-button";
            logCanvasButton.innerHTML = "Log Canvas Nodes";

            $(logCanvasButton).on("click", () => {
                infraRED.events.emit("nodes:log-canvas");
            });

            logResourcesButton.className = "menu-button";
            logResourcesButton.id = "log-resources-button";
            logResourcesButton.innerHTML = "Log Resource Nodes";

            $(logResourcesButton).on("click", () => {
                infraRED.events.emit("nodes:log-resources");
            });

            content.append(logResourcesButton);
            content.append(logCanvasButton);
        },
        get: function() {
            return menuBar;
        },
    };
})();