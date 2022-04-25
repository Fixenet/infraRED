// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridOffset(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function updateGrid() {
        let grid = document.createElementNS(SVGnamespace, "g");
        grid.id = "canvas-grid";

        let line;
        for (let row = gridSizeGap; row < canvasSizeH; row += gridSizeGap) {
            line = document.createElementNS(SVGnamespace, "line");
            $(line).attr({
                class: "canvas-grid-horizontal-line",
                x1: 0,
                x2: canvasSizeW,
                y1: row,
                y2: row,
            });
            grid.append(line);
        }

        for (let column = gridSizeGap; column < canvasSizeW; column += gridSizeGap) {
            line = document.createElementNS(SVGnamespace, "line");
            $(line).attr({
                class: "canvas-grid-vertical-line",
                y1: 0,
                y2: canvasSizeW,
                x1: column,
                x2: column,
            });
            grid.append(line);
        }
        return grid;
    }

    function drawRelationshipLine(capabilityDiv, requirementDiv) {
        let relationshipLine = document.createElementNS(SVGnamespace, "line");

        //TODO - this is the whole node position
        let capabilityPosition = capabilityDiv.parent().parent().position();
        let requirementPosition = requirementDiv.parent().parent().position();

        //TODO - x1,y1 may not be the requirement per say (and vice-versa)
        //but the values are interchangeable since it's a line from one to the other
        //bad if i required difference between the ends of the line

        //learned that .position() gives me the boundary of the margin box
        //so i must subtract that from the value the margin
        $(relationshipLine).attr({
            class: "canvas-relationship-line",
            x1: requirementPosition.left + requirementDiv.position().left,
            y1: requirementPosition.top + requirementDiv.position().top + parseFloat(requirementDiv.css("margin")) + requirementDiv.height(),
            x2: capabilityPosition.left + capabilityDiv.position().left + capabilityDiv.width(),
            y2: capabilityPosition.top + capabilityDiv.position().top + parseFloat(capabilityDiv.css("margin")) + capabilityDiv.height(),
        });

        return relationshipLine;
    }

    return {
        init: function() {
            console.log("%cCreating Canvas...", "color: #ffc895");

            canvas = $("#infraRED-ui-canvas");

            let content = $("<div>", {
                id: "canvas-content",
                class: "content",
            });

            content.droppable({
                tolerance: "fit",
                hoverClass: "canvas-hover-drop",
                accept: ".resource",

                drop: function(event, ui) {
                    let droppedNodeDiv = $(ui.helper).clone();

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop();
                        
                    let left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridOffset(left);
                    top = roundToGridOffset(top);

                    droppedNodeDiv.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });

                    droppedNodeDiv.removeClass("resource");
                    $(this).append(droppedNodeDiv);

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("id"));
                    //let any editor element know the node in question changed sides
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedNodeDiv);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).addClass("canvas-svg");
            $(canvasSVG).append(updateGrid());

            //TODO - redesign this whole process, I need to have named connections between these
            //must make use of the relationships.js file
            infraRED.events.on("canvas:draw-connection", (capabilityDiv, requirementDiv) => {
                //TODO - rethink my svg use,
                //right now i have a svg and divs in play together
                //maybe i should draw everything as a svg composition so i can more easily move elements 
                $(canvasSVG).append(drawRelationshipLine(capabilityDiv, requirementDiv));
                removePreviewLine();
            });

            function removePreviewLine() {
                $(previewRelationshipLine).remove();
                previewRelationshipLine = null;
                startingPosition = null;
                infraRED.events.emit("nodes:stop-draw-preview-line");
            }

            let lineEnd = { x: null, y: null };
            let previewRelationshipLine,
                startingPosition;

            $(canvasSVG).on("mousemove", (event) => {
                event.stopPropagation();
                // save the position of the cursor in relation to the canvas grid
                lineEnd.x = event.offsetX;
                lineEnd.y = event.offsetY;

                if (previewRelationshipLine) {
                    $(previewRelationshipLine).attr({
                        class: "canvas-preview-relationship-line",
                        x1: startingPosition.left,
                        y1: startingPosition.top,
                        x2: lineEnd.x,
                        y2: lineEnd.y,
                    });
                }
            });

            $(canvasSVG).on("mousedown", (event) => {
                removePreviewLine();
            });
            
            infraRED.events.on("canvas:start-draw-preview-line", (startingDiv) => {
                startingPosition = startingDiv.parent().parent().position();

                previewRelationshipLine = document.createElementNS(SVGnamespace, "line");
                $(previewRelationshipLine).attr({
                    class: "canvas-preview-relationship-line",
                    x1: startingPosition.left,
                    y1: startingPosition.top,
                    x2: lineEnd.x,
                    y2: lineEnd.y,
                });
                $(canvasSVG).append(previewRelationshipLine);
            });

            content.append(canvasSVG);
            canvas.append(content);
        }
    };
})();