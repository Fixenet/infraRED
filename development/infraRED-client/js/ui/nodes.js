// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    return {
        init: function() {
            $(".resource-node").draggable({
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,

                create: function(event, ui) {
                    console.log("Create Drag");
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    console.log("Start Drag");
                    $(ui.helper).width();
                },
                drag: function(event, ui) {
                    console.log("Dragging");
                },
                stop: function(event, ui) {
                    console.log("Stop Drag");
                },
            });
            
            infraRED.events.on("node:canvas-drop", (droppedNode) => {
                droppedNode.removeClass("resource-node");
                droppedNode.addClass("canvas-node");
            
                droppedNode.draggable({
                    containment: "parent",
                });
                    
                droppedNode.dblclick(() => {
                    droppedNode.remove();
                });
            });
        }
    };
})();