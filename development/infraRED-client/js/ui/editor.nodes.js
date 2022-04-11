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
                    $(this).data('node', event.currentTarget.id);
                },
                drag: function(event, ui) {
                },
                stop: function(event, ui) {
                },
            });

            var connecting = false;
            var req = null;
            var cap = null;
            
            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeElement) => {
                droppedNodeElement.removeClass("resource-node");
                droppedNodeElement.addClass("canvas-node");
            
                droppedNodeElement.draggable({
                    containment: "parent",
                    stack: ".canvas-node",
                    scroll: false,
                    grid: [gridSizeGap, gridSizeGap],

                    drag: function() {
                    },
                });

                let canvasNode = infraRED.nodes.add(droppedNode);

                droppedNodeElement.on("dblclick", () => {
                    droppedNodeElement.remove();
                    infraRED.nodes.remove(canvasNode);
                });

                $(droppedNodeElement).children("div.requirements").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && cap != null) {
                        req = $(e.currentTarget);
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", req, cap);
                        infraRED.events.emit("canvas:draw-connection", req, cap);

                        connecting = false; req = null; cap = null;
                    } else if (req == null) {
                        req = $(e.currentTarget);
                        connecting = true;
                    } else {
                        console.log("Already chose requirement.");
                    }
                });

                $(droppedNodeElement).children("div.capabilities").children().on("click", (e) => {
                    e.stopPropagation();

                    if (connecting && req != null) {
                        cap = $(e.currentTarget);
                        console.log(`Connected ${cap.text()} to ${req.text()}`);

                        infraRED.events.emit("canvas:create-connection", req, cap);
                        infraRED.events.emit("canvas:draw-connection", req, cap);

                        connecting = false; req = null; cap = null;
                    } else if (cap == null) {
                        cap = $(e.currentTarget);
                        connecting = true;
                    } else {
                        console.log("Already chose capability.");
                    }
                });
            });
        }
    };
})();