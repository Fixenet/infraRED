// use this file to define node behaviour
infraRED.editor.nodes = (function () {
    function createCanvasNode(canvasNode, droppedNodeDiv) {
        droppedNodeDiv.removeClass("resource-node ui-draggable-dragging");
        droppedNodeDiv.addClass("canvas-node");

        droppedNodeDiv.draggable({
            containment: "parent",
            stack: ".canvas-node",
            scroll: false,
            grid: [gridSizeGap, gridSizeGap],
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

    // this div holds the start of the Relationship preview line
    let startingDiv = null;

    function resetConnection() {
        // reset all the elements related to drawing the connection
        connectingRelationship = false;

        capabilityNode = null;
        capabilityDiv = null;
        capability = null;

        requirementNode = null;
        requirementDiv = null;
        requirement = null;

        if (startingDiv) startingDiv.toggleClass("selected-connectable");
        startingDiv = null; // might be unnecessary
    }

    infraRED.events.on("nodes:stop-draw-preview-line", () => {
        resetConnection();
    });
    
    function connectRelationship(node, event) {
        if (connectingRelationship) { // we already made the first selection and now are trying to make a connection
            if (capabilityNode == node || requirementNode == node) {
                console.log("Cannot connect capabilities/requirements of the same node...");
                return;
            }

            if ($(event.currentTarget).hasClass("capability") && requirementNode != null) {
                capabilityNode = node;
                capabilityDiv = $(event.currentTarget);
                capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
            } else if ($(event.currentTarget).hasClass("requirement") && capabilityNode != null) {
                requirementNode = node;
                requirementDiv = $(event.currentTarget);
                requirement = requirementNode.requirements[requirementDiv.attr("type")];
            } else {
                console.log("Please connect a capability to a requirement...");
                return;
            }

            infraRED.events.emit("canvas:create-connection", capability, capabilityNode, requirement, requirementNode);
            infraRED.events.emit("canvas:draw-connection", capabilityDiv, requirementDiv);

            resetConnection();
        } else { // we haven't chosen the first selection to start connecting
            if (capabilityNode == null && requirementNode == null) {
                if ($(event.currentTarget).hasClass("capability")) {
                    capabilityNode = node;
                    capabilityDiv = $(event.currentTarget);
                    capability = capabilityNode.capabilities[capabilityDiv.attr("type")];
                } else if ($(event.currentTarget).hasClass("requirement")) {
                    requirementNode = node;
                    requirementDiv = $(event.currentTarget);
                    requirement = requirementNode.requirements[requirementDiv.attr("type")];
                }
                connectingRelationship = true;

                startingDiv = capabilityDiv ? capabilityDiv : requirementDiv;
                startingDiv.toggleClass("selected-connectable");

                // an element was selected as first, let's draw a line from that element
                infraRED.events.emit("canvas:start-draw-preview-line", startingDiv);
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

            infraRED.events.on("nodes:log-current-connection", () => {
                console.log("Nodes", capabilityNode, requirementNode);
                console.log("Connections", capability, requirement);
                console.log("Start", startingDiv);
            });

            infraRED.events.on("nodes:canvas-drop", (droppedNode, droppedNodeDiv) => {
                let canvasNode = infraRED.nodes.add(droppedNode);
                
                // "add" method will return null and we know we are supposed to remove
                //TODO - this may be prone to errors, since i may generate null through other ways
                if (canvasNode == null) {
                    droppedNodeDiv.remove(); return;
                }

                createCanvasNode(canvasNode, droppedNodeDiv);

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