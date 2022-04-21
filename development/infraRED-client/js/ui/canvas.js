// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridCenter(position) {
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
                    let droppedElement = $(ui.helper).clone();

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop(),
                        
                        left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                    left = roundToGridCenter(left);
                    top = roundToGridCenter(top);

                    droppedElement.css({
                        "position": "absolute",
                        "left": left,
                        "top": top,
                    });

                    droppedElement.removeClass("resource");

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("id"));
                    //let any editor element know the node in question changed sides
                    
                    $(this).append(droppedElement);
                    infraRED.events.emit("nodes:canvas-drop", resourceNode, droppedElement);
                },
            });

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).addClass("canvas-svg");
            $(canvasSVG).append(updateGrid());

            //TODO - redesign this whole process, I need to have named connections between these
            //must make use of the relationships.js file
            infraRED.events.on("canvas:draw-connection", (req, cap, reqNode, capNode) => {
                //TODO - rethink my svg use,
                //right now i have a svg and divs in play together
                //maybe i should draw everything as a svg composition so i can more easily move elements 
                let connectionLine = document.createElementNS(SVGnamespace, "line");

                //TODO - this is the whole node position
                let requirementPosition = req.parent().parent().position();
                let capabilityPosition = cap.parent().parent().position();

                //TODO - x1,y1 may not be the requirement per say (and vice-versa)
                //but the values are interchangeable since it's a line from one to the other

                //learned that .position() gives me the boundary of the margin box
                //so i must subtract that from the value the margin
                $(connectionLine).attr({
                    class: "canvas-relationship-line",
                    x1: requirementPosition.left + req.position().left,
                    y1: requirementPosition.top + req.position().top + parseFloat(req.css("margin")) + req.height(),
                    x2: capabilityPosition.left + cap.position().left + cap.width(),
                    y2: capabilityPosition.top + cap.position().top + parseFloat(cap.css("margin")) + cap.height(),
                });

                $(canvasSVG).append(connectionLine);
            });

            content.append(canvasSVG);

            canvas.append(content);
        }
    };
})();