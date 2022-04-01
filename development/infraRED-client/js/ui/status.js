// use this file to define the status bar
infraRED.editor.status = (function() {
    let statusBar;
    let content;

    return {
        init: function() {
            console.log("Creating Status Bar...");

            statusBar = $("#infraRED-ui-status-bar");

            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Status";
        
            statusBar.append(title);

            content = document.createElement("div");
            content.className = "content";

            statusBar.append(content);
        },
        get: function() {
            return statusBar;
        },
        log: function(msg) {
            content.innerHTML = `<p>${msg}</p>`;
        }
    };
})();