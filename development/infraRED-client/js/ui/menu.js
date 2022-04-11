// use this file to define the menu bar
infraRED.editor.menuBar = (function() {
    let menuBar;

    return {
        init: function() {
            console.log("%cCreating Menu Bar...", "color: #a6c9ff");

            menuBar = $("#infraRED-ui-menu-bar");

            let content = $("<div>", {
                id: "menu-bar-content",
                class: "content",
            });
            menuBar.append(content);

            let logResourcesButton = $("<button>", {
                id: "log-resources-button",
                class: "menu-bar-button",
                html: "Log Resources Nodes",
            });

            $(logResourcesButton).on("click", () => {
                infraRED.events.emit("nodes:log-resources");
            });

            let logCanvasButton = $("<button>", {
                id: "log-canvas-button",
                class: "menu-bar-button",
                html: "Log Canvas Nodes",
            });

            $(logCanvasButton).on("click", () => {
                infraRED.events.emit("nodes:log-canvas");
            });

            content.append(logResourcesButton);
            content.append(logCanvasButton);
        },
        get: function() {
            return menuBar;
        },
    };
})();