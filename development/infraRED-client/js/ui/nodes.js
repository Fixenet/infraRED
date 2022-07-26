// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    function onCanvasDrop(droppedNode, droppedNodeSVG) {
        let canvasNode = infraRED.nodes.add(droppedNode);
                
        // 'add' method will return null and we know we are supposed to remove
        //TODO - this may be prone to errors, since i may generate null through other ways
        if (canvasNode == null) {
            droppedNodeSVG.remove();
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
        }
    };
})();