// use this file to define the status bar
infraRED.editor.statusBar = (function() {
    let statusBar;
    let content;

    return {
        init: function() {
            console.log("Creating Status Bar...");

            statusBar = $("#infraRED-ui-status-bar");

            let title = $("<div>", {
                id: "status-bar-title",
                class: "title",
                text: "Status",
            });
            //statusBar.append(title);

            content = $("<div>", {
                id: "status-bar-content",
                class: "content",
            });
            statusBar.append(content);
        },
        get: function() {
            return statusBar;
        },
        log: function(msg) {
            content.text(msg);
        }
    };
})();