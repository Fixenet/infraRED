// use this file to define the status bar
infraRED.editor.status = (function() {
    let statusBar;

    return {
        init: function() {
            console.log("Creating Status Bar...");

            statusBar = $("#infraRED-ui-status-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Status";
        
            statusBar.append(title);
        },
        get: function() {
            return statusBar;
        },
    };
})();