// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    return {
        init: function() {
            $(".resource-node").draggable({
                appendTo: "#infraRED-ui-root",
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,
                revert: "invalid",
                revertDuration: 300,
                create: function(event, ui) {
                    //HTML page loads with 90% width so it's responsive to the layout
                    //this then creates the draggable with static width so the width doesnt change at the moment of drag
                    $(this).css("width", $(this).width());
                },
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: "node",
                    });
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });

            var connecting = false;
            var reqNode = null;
            var capNode = null;
            var req = null;
            var cap = null;
            
            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeElement) => {
                let canvasNode = infraRED.nodes.add(droppedNode);
                
                // add method will return null and we know we are supposed to remove
                //TODO - this may be prone to errors, since i may generate null through other ways
                if (canvasNode == null) {
                    droppedNodeElement.remove();
                    return;
                }

                droppedNodeElement.removeClass("resource-node ui-draggable-dragging");
                droppedNodeElement.addClass("canvas-node");
            
                //TODO - maybe fix this to be more intelligent
                let canvasDragStart = { "top": 0, "left": 0 };

                let canvasDraggedLast = { "top": -1, "left": -1 };
                let canvasDragged = { "top": 0, "left": 0 };

                droppedNodeElement.draggable({
                    containment: "parent",

                    //TODO - possibly change this element into a generic one that affects all categories
                    stack: ".canvas-node",
                    scroll: false,
                    grid: [gridSizeGap, gridSizeGap],

                    start: function(event, ui) {
                        //TODO - this is very bad pls change
                        canvasDraggedLast = { "top": -1, "left": -1 };

                        canvasDragStart.left = ui.position.left;
                        canvasDragStart.top = ui.position.top;
                    },
                    drag: function(event, ui) {
                        //TODO - this is very bad pls change
                        canvasDragged.left = canvasDragStart.left - ui.position.left;
                        canvasDragged.top = canvasDragStart.top - ui.position.top;
  
                        if (canvasDragged.left != canvasDraggedLast.left || canvasDragged.top != canvasDraggedLast.top) {
                            canvasDragStart.left = ui.position.left;
                            canvasDragStart.top = ui.position.top;

                            canvasDraggedLast.left = canvasDragged.left;
                            canvasDraggedLast.top = canvasDragged.top;
                        }
                    },
                    stop: function(event, ui) {
                    },
                });

                droppedNodeElement.on("dblclick", () => {
                    droppedNodeElement.remove();
                    infraRED.nodes.remove(canvasNode);
                });

                $(droppedNodeElement).children("div.requirements").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && cap != null) {
                        req = $(e.currentTarget);
                        reqNode = canvasNode;
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", reqNode, capNode);
                        infraRED.events.emit("canvas:draw-connection", req, cap, reqNode, capNode);

                        connecting = false; req = null; cap = null; reqNode = null; capNode = null;
                    } else if (req == null) {
                        req = $(e.currentTarget);
                        reqNode = canvasNode;
                        connecting = true;
                    } else {
                        console.log("Already chose requirement.");
                    }
                });

                $(droppedNodeElement).children("div.capabilities").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && req != null) {
                        cap = $(e.currentTarget);
                        capNode = canvasNode;
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", reqNode, capNode);
                        infraRED.events.emit("canvas:draw-connection", req, cap, reqNode, capNode);

                        connecting = false; req = null; cap = null;
                    } else if (cap == null) {
                        cap = $(e.currentTarget);
                        capNode = canvasNode;
                        connecting = true;
                    } else {
                        console.log("Already chose capability.");
                    }
                });
            });
        }
    };
})();