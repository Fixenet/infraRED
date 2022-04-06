// use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    let canvas;

    //maybe move this somewhere or not, since only the canvas should deal with svg stuff
    const SVGnamespace = "http://www.w3.org/2000/svg";

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridCenter(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function updateGrid(ya) {
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
            canvas = $("#infraRED-ui-canvas");

            let content = $("<div>", {
                id: "canvas-content",
                class: "content",
            });

            content.droppable({
                tolerance: "fit",
                hoverClass: "canvas-hover-drop",
                accept: ".resource-node",

                drop: function(event, ui) {
                    let droppedNodeElement = $(ui.helper).clone();

                    let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data("node"));

                    // use this so the node drops in the canvas on the place where the mouse was lifted at
                    let draggableOffset = ui.helper.offset(),
                        droppableOffset = $(this).offset(),
                        scrollOffsetLeft = $(this).scrollLeft(),
                        scrollOffsetTop = $(this).scrollTop(),
                        
                        left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
                        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

                        left = roundToGridCenter(left);
                        top = roundToGridCenter(top);

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

            let canvasSVG = document.createElementNS(SVGnamespace, "svg");
            canvasSVG.setAttribute("width", canvasSizeW);
            canvasSVG.setAttribute("height", canvasSizeH);

            $(canvasSVG).append(updateGrid());

            content.append(canvasSVG);

            canvas.append(content);
        }
    };
})();