// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    return {
        init: function() {
            canvas = $("#infraRED-ui-canvas");
        
            let title = $("<div>", {
                id: "canvas-title",
                class: "title",
                text: "Canvas",
            });
        
            //canvas.append(title);

            let content = $("<div>", {
                id: "canvas-content",
                class: "content",
            });

            content.droppable({
                tolerance: "fit",
                hoverClass: "canvas-hover-drop",
                accept: ".resource-node",
                over: function(event, ui) {
                },
                drop: function(event, ui) {
                    let droppedNodeElement = $(ui.helper).clone();

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("node"));

                    // use this so the node drops in the canvas on the place where the mouse was lifted
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        left = draggableOffset.left - droppableOffset.left,
                        top = draggableOffset.top - droppableOffset.top;

                    droppedNodeElement.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });
                    
                    //let any editor element know the node in question changed sides
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedNodeElement);
            
                    $(this).append(droppedNodeElement);
                },
            });

            canvas.append(content);
        }
    };
})();