// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    return {
        init: function() {
            canvas = $("#infraRED-ui-canvas");
        
            let title = document.createElement("div");
            title.className = "title";
            title.innerHTML = "Canvas";
        
            canvas.append(title);

            let content = document.createElement("div");
            content.className = "content";

            $(content).droppable({
                tolerance: "fit",
                hoverClass: "node-hover-drop",
                accept: ".resource-node",
                drop: function(event, ui) {
                    let droppedNode = $(ui.helper).clone();
            
                    //let the editor know the node in question changed sides
                    infraRED.events.emit("node:canvas-drop", droppedNode);
            
                    $(this).append(droppedNode);
                },
            });

            canvas.append(content);
        }
    };
})();