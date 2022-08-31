//use this file to define node behaviour
infraRED.editor.nodes = (function () {
    function onCanvasDrop(droppedNode, coordinates) {
        let canvasNode = infraRED.nodes.add(droppedNode);
        if (canvasNode != 'full canvas') {
            infraRED.events.emit('nodes:canvas-drop-success', canvasNode, coordinates);
        }
    }

    return {
        init: function() {
            $('.resource-node').draggable({
                appendTo: '#infraRED-ui-root',
                containment: '#infraRED-ui-root',
                helper: 'clone',
                scroll: false,
                revert: 'invalid',
                revertDuration: 300,
                
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: 'node',
                    });
                },
            });

            infraRED.events.on('nodes:canvas-drop', onCanvasDrop);
        },
        update: function(resourceNode) {
            resourceNode.draggable({
                appendTo: '#infraRED-ui-root',
                containment: '#infraRED-ui-root',
                helper: 'clone',
                scroll: false,
                revert: 'invalid',
                revertDuration: 300,
                
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: 'node',
                    });
                },
            });
        },
    };
})();