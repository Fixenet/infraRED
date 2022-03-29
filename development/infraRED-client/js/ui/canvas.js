// use this file to define the canvas bar
canvas.droppable({
    tolerance: "fit",
    hoverClass: "drop-hover",
    accept: ".resource-node",
    drop: function(event, ui) {
        let droppedNode = $(ui.helper).clone();

        //let the editor know the node in question changed sides
        droppedNode.removeClass("resource-node");
        droppedNode.addClass("canvas-node");

        droppedNode.draggable({
            containment: "parent",
        });
        
        droppedNode.dblclick(() => {
            droppedNode.remove();
        });

        $(this).append(droppedNode);
    },
});