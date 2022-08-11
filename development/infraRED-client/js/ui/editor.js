// use this file to define the base layout for the editor
infraRED.editor = (function() {
    return {
        init: function() {
            console.log('%cCreating Editor...', 'color: red');

            let resourceBar = $('<div>', { id: 'infraRED-ui-resource-bar'});
            $('#infraRED-ui-root').append(resourceBar);
            infraRED.editor.resourceBar.init();

            let categoryBar = $('<div>', { id: 'infraRED-ui-category-bar'});
            $('#infraRED-ui-root').append(categoryBar);
            infraRED.editor.categoryBar.init();

            let canvas = $('<div>', { id: 'infraRED-ui-canvas'});
            $('#infraRED-ui-root').append(canvas);
            infraRED.editor.canvas.init();

            let menuBar = $('<div>', { id: 'infraRED-ui-menu-bar'});
            $('#infraRED-ui-root').append(menuBar);
            infraRED.editor.menuBar.init();

            let statusBar = $('<div>', { id: 'infraRED-ui-status-bar'});
            $('#infraRED-ui-root').append(statusBar);
            infraRED.editor.statusBar.init();

            infraRED.editor.nodes.init();
        },
    };
})();