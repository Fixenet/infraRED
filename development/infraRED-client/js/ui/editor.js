// use this file to define the base layout for the editor
infraRED.editor = (function() {
    return {
        init: function() {
            console.log("Creating Editor...");

            $("#infraRED-ui-root").append('<div id="infraRED-ui-menu-bar"></div>');
            infraRED.editor.menu.init();

            $("#infraRED-ui-root").append('<div id="infraRED-ui-category-bar"></div>');
            infraRED.editor.category.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-resource-bar"></div>');
            infraRED.editor.resource.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-canvas"></div>');
            infraRED.editor.canvas.init();
    
            $("#infraRED-ui-root").append('<div id="infraRED-ui-status-bar"></div>');
            infraRED.editor.status.init();

            infraRED.editor.nodes.init();
        },
    };
})();