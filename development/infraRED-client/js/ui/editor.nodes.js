// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    return {
        init: function() {
            $(".resource-node").draggable({
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,

                create: function(event, ui) {
                    //HTML page loads with 90% width so it's responsive to the layout
                    //this then creates the draggable with static width so the width doesnt change at the moment of drag
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    $(this).data('node', event.currentTarget.id);
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });
            
            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeElement) => {
                droppedNodeElement.removeClass("resource-node");
                droppedNodeElement.addClass("canvas-node");
            
                droppedNodeElement.draggable({
                    containment: "parent",
                });

                let canvasNode = infraRED.nodes.add(droppedNode);

                droppedNodeElement.dblclick(() => {
                    droppedNodeElement.remove();
                    infraRED.nodes.remove(canvasNode);
                });
            });
        }
    };
})();