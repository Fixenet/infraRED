// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    function createCanvasNode(droppedNodeDiv) {
        droppedNodeDiv.removeClass("resource-node ui-draggable-dragging");
        droppedNodeDiv.addClass("canvas-node");

        droppedNodeDiv.draggable({
            containment: "parent",
            stack: ".canvas-node",
            scroll: false,
            grid: [gridSizeGap, gridSizeGap],

            start: function(event, ui) {
            },
            drag: function(event, ui) {
            },
        });

        droppedNodeDiv.on("dblclick", () => {
            droppedNodeDiv.remove();
            infraRED.nodes.remove(canvasNode);
            infraRED.events.emit("nodes:removed-node", canvasNode);
        });
    }

    let connectingRelationship = false;
    
    let capabilityNode = null;      
    let requirementNode = null;

    let capability = null;
    let requirement = null;

    let capabilityDiv = null;
    let requirementDiv = null;
    
    function connectRelationship(node, event) {
        
        if (connectingRelationship) { // we already made the first selection and now are trying to make a connection
            if (capabilityNode == node || requirementNode == node) {
                console.log("Cannot connect capabilities/requirements of the same node...");
                return;
            }

            if (event.currentTarget.className === "capability" && requirementNode != null) {
                capabilityNode = node;
                capabilityDiv = $(event.currentTarget);
                capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
            } else if (event.currentTarget.className === "requirement" && capabilityNode != null) {
                requirementNode = node;
                requirementDiv = $(event.currentTarget);
                requirement = requirementNode.requirements[requirementDiv.attr("type")];
            } else {
                console.log("Please connect a capability to a requirement...");
                return;
            }

            infraRED.events.emit("canvas:create-connection", capability, capabilityNode, requirement, requirementNode);
            infraRED.events.emit("canvas:draw-connection", capabilityDiv, requirementDiv);

            connectingRelationship = false;

            capabilityNode = null;
            capabilityDiv = null;
            capability = null;

            requirementNode = null;
            requirementDiv = null;
            requirement = null;
        } else { // we haven't chosen the first selection to start connecting
            if (capabilityNode == null && requirementNode == null) {
                if (event.currentTarget.className === "capability") {
                    capabilityNode = node;
                    capabilityDiv = $(event.currentTarget);
                    capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
                } else if (event.currentTarget.className === "requirement") {
                    requirementNode = node;
                    requirementDiv = $(event.currentTarget);
                    requirement = requirementNode.requirements[requirementDiv.attr("type")];
                }
                connectingRelationship = true;
            }
        }
    }

    return {
        init: function() {
            $(".resource-node").draggable({
                appendTo: "#infraRED-ui-root",
                helper: "clone",
                containment: "#infraRED-ui-root",
                scroll: false,
                revert: "invalid",
                revertDuration: 300,
                
                start: function(event, ui) {
                    $(this).data({
                        id: event.currentTarget.id,
                        type: "node",
                    });
                },
            });

            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeDiv) => {
                let canvasNode = infraRED.nodes.add(droppedNode);
                
                // "add" method will return null and we know we are supposed to remove
                //TODO - this may be prone to errors, since i may generate null through other ways
                if (canvasNode == null) {
                    droppedNodeDiv.remove(); return;
                }

                createCanvasNode(droppedNodeDiv);

                let capabilityDivs = $(droppedNodeDiv).children("div.capabilities").children();
                let requirementDivs = $(droppedNodeDiv).children("div.requirements").children();

                capabilityDivs.on("click", (event) => {
                    event.stopPropagation();
                    connectRelationship(canvasNode, event);
                });

                requirementDivs.on("click", (event) => {
                    event.stopPropagation();
                    connectRelationship(canvasNode, event);
                });
            });
        }
    };
})();