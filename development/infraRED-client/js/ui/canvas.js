// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvasDraw; // variable used to draw on the canvas

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridOffset(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function createGrid() {
        let grid = canvasDraw.group().attr({ id: "canvas-grid" });

        for (let row = gridSizeGap; row < canvasSizeH; row += gridSizeGap) {
            grid.line(0, row, canvasSizeW, row).addClass("canvas-grid-horizontal-line");
        }

        for (let column = gridSizeGap; column < canvasSizeW; column += gridSizeGap) {
            grid.line(column, 0, column, canvasSizeW).addClass("canvas-grid-vertical-line");
        }
    }

    function createCanvasEnvironment(canvasSVG) {
        canvasDraw = SVG(canvasSVG).size(canvasSizeW, canvasSizeH);
        createGrid();
    }

    let lineEndPosition  = { x: null, y: null };
    let relationshipPreviewLine = null,
        startingPosition = { rightSide: true, left: null, right: null, top: null };

    function removeRelationshipPreviewLine() {
        relationshipPreviewLine.remove();
        relationshipPreviewLine = null;
        infraRED.events.emit("canvas:reset-connection");
    }

    function drawRelationshipPreviewLine() {
        lineCoordinates = [startingPosition.rightSide ? startingPosition.right : startingPosition.left,
            startingPosition.top,
            lineEndPosition.x,
            lineEndPosition.y];

        if (relationshipPreviewLine != null) {
            relationshipPreviewLine = relationshipPreviewLine.plot(lineCoordinates);
        } else {
            relationshipPreviewLine = canvasDraw.line(lineCoordinates);
            relationshipPreviewLine.addClass("canvas-preview-relationship-line");
        }
    }

    function drawRelationshipLine(capability, requirement) {
        let start = { x: capability.x(), y: capability.cy()};
        let end = { x: requirement.x(), y: requirement.cy()};

        if (start.x < end.x) { // we are to the right
            start.x += capability.width();
        } else {
            end.x += requirement.width();
        }

        let relationshipLine = canvasDraw.line(start.x, start.y, end.x, end.y);
        relationshipLine.addClass("canvas-relationship-line");
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
                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop();
                        
                    let left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridOffset(left);
                    top = roundToGridOffset(top);

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("id"));

                    let canvasNode = resourceNode.getSVG();
                    canvasNode.move(left, top);
                    canvasDraw.add(canvasNode);

                    //let any editor element know the node in question changed sides
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, canvasNode);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            $(canvasSVG).addClass("canvas-svg");

            createCanvasEnvironment(canvasSVG);

            infraRED.events.on("canvas:draw-connection", (capabilitySVG, requirementSVG) => {
                capabilitySVG.removeClass("selected-connectable");
                requirementSVG.removeClass("selected-connectable");
                drawRelationshipLine(capabilitySVG, requirementSVG);
                if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
            });

            canvasDraw.on("mousemove", (event) => {
                if (relationshipPreviewLine != null) {
                    // save the position of the cursor in relation to the canvas grid
                    lineEndPosition.x = event.offsetX-10;
                    lineEndPosition.y = event.offsetY-10;
                    // check if we are to the right of the connectable
                    startingPosition.rightSide = lineEndPosition.x > startingPosition.right;
                    drawRelationshipPreviewLine();
                }
            });

            canvasDraw.on("click", (event) => {
                if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
            });
            
            infraRED.events.on("canvas:start-draw-preview-line", (connectable) => {
                startingPosition = {
                    // left side
                    left: connectable.x(),
                    // right side
                    right: connectable.x() + connectable.width(),
                    // middle height
                    top: connectable.cy(),
                };

                lineEndPosition = { 
                    x: startingPosition.left, 
                    y: startingPosition.top 
                };

                drawRelationshipPreviewLine();
            });

            infraRED.events.on("canvas:draw-relationship-line", (capability, requirement) => {
                drawRelationshipLine(capability, requirement);
                removeRelationshipPreviewLine();
            });

            content.append(canvasSVG);
            canvas.append(content);
        }
    };
})();