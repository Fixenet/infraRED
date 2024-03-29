//use this file to define the status bar
infraRED.editor.statusBar = (function() {
    let statusBar;
    let content;

    return {
        init: function() {
            console.log('%cCreating Status Bar...', 'color: #ffe493');

            statusBar = $('#infraRED-ui-status-bar');

            content = $('<div>', {
                id: 'status-bar-content',
                class: 'content',
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