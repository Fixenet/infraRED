//use this file to define the canvas bar
infraRED.editor.canvas = (function() {
    const canvasSizeW = infraRED.settings.canvas.canvasSizeW;
    const canvasSizeH = infraRED.settings.canvas.canvasSizeH;
    const gridSizeGap = infraRED.settings.canvas.gridSizeGap;

    const SVGnamespace = infraRED.settings.canvas.SVGnamespace;

    let canvasDraw; //variable used to draw on the canvas, from SVG.js 3.0

    function roundToGrid(position) {
        return Math.round(position / gridSizeGap) * gridSizeGap;
    }

    function roundToGridOffset(position) {
        return roundToGrid(position) + gridSizeGap / 4;
    }

    function createGrid() {
        let grid = canvasDraw.group().attr({ id: 'canvas-grid' });

        for (let row = gridSizeGap; row < canvasSizeH; row += gridSizeGap) {
            grid.line(0, row, canvasSizeW, row).addClass('canvas-grid-horizontal-line');
        }

        for (let column = gridSizeGap; column < canvasSizeW; column += gridSizeGap) {
            grid.line(column, 0, column, canvasSizeW).addClass('canvas-grid-vertical-line');
        }
    }

    function createCanvasEnvironment(canvasSVG) {
        canvasDraw = SVG(canvasSVG).size(canvasSizeW, canvasSizeH).addClass('canvas-svg');
        createGrid();
    }

    let lineEndPosition  = { x: null, y: null };
    let relationshipPreviewLine = null,
        startingPosition = { rightSide: true, left: null, right: null, top: null };

    function removeRelationshipPreviewLine() {
        relationshipPreviewLine.remove();
        relationshipPreviewLine = null;
        infraRED.events.emit('canvas:reset-connection');
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
            relationshipPreviewLine.marker('end', 4, 4, function(add) {
                add.polygon().plot([ //create a triangle
                    [1,0],
                    [1,4],
                    [4,2]
                ]).fill('#0e83bd');
            });
            relationshipPreviewLine.addClass('canvas-preview-relationship-line');
        }
    }

    function drawRelationshipLine(capabilitySVG, requirementSVG) {
        let start = { x: capabilitySVG.x(), y: capabilitySVG.cy()};
        let end = { x: requirementSVG.x(), y: requirementSVG.cy()};

        if (start.x < end.x) { //we are to the right
            start.x += capabilitySVG.width();
        } else {
            end.x += requirementSVG.width();
        }

        let relationshipLine = canvasDraw.line(start.x, start.y, end.x, end.y);
        relationshipLine.addClass('canvas-relationship-line');
        return relationshipLine;
    }

    function createRelationshipConnection(connectionVariables, relationship) {
        let capabilitySVG = connectionVariables.capabilitySVG,
            requirementSVG = connectionVariables.requirementSVG;

        //draw the final line
        capabilitySVG.removeClass('selected-connectable');
        requirementSVG.removeClass('selected-connectable');
        let line = drawRelationshipLine(capabilitySVG, requirementSVG);

        //logic so that lines can react to mousemove of their node
        relationship.addLine(line);

        //clean relationship preview line
        if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
    }

    function createRelationshipPreviewLine(connectable) {
        startingPosition = {
            //left side
            left: connectable.x(),
            //right side
            right: connectable.x() + connectable.width(),
            //middle height
            top: connectable.cy(),
        };

        lineEndPosition = { 
            x: startingPosition.left, 
            y: startingPosition.top 
        };

        drawRelationshipPreviewLine();
    }

    function onContentDrop(event, ui) {
        //use this so the node drops in the canvas on the place where the mouse was lifted at
        let draggableOffset = ui.helper.offset(),
        droppableOffset = $(this).offset(),
        scrollOffsetLeft = $(this).scrollLeft(),
        scrollOffsetTop = $(this).scrollTop();

        let left = draggableOffset.left - droppableOffset.left + scrollOffsetLeft,
        top = draggableOffset.top - droppableOffset.top + scrollOffsetTop;

        left = roundToGridOffset(left);
        top = roundToGridOffset(top);

        let resourceNode = infraRED.nodes.resourceList.getByID(ui.draggable.data('id'));

        //let any editor element know the node in question changed sides
        infraRED.events.emit('nodes:canvas-drop', resourceNode, {left, top});
    }

    function contentDropSuccess(canvasNode, {left, top}) {
        let canvasNodeSVG = canvasNode.getSVG();
        canvasNodeSVG.move(left, top);
        canvasDraw.add(canvasNodeSVG);
    }

    function onMouseMove(event) {
        if (relationshipPreviewLine != null) {
            //save the position of the cursor in relation to the canvas grid
            lineEndPosition.x = event.offsetX;
            lineEndPosition.y = event.offsetY;
            //check if we are to the right of the connectable
            startingPosition.rightSide = lineEndPosition.x > startingPosition.right;
            drawRelationshipPreviewLine();
        }
        //this movement only happens if we have a selected node for moving
        //we then only use the 'canvasSelectedDragNode' variable to do movement based on itself
        //and not the triggerer of the 'mousemove' event
        let canvasSelectedDragNode = infraRED.nodes.draggingNode();
        if (canvasSelectedDragNode != null) {
            let dragX = event.offsetX - canvasSelectedDragNode.offsetX;
            let dragY = event.offsetY - canvasSelectedDragNode.offsetY;

            canvasSelectedDragNode.SVG.x(dragX);
            canvasSelectedDragNode.SVG.y(dragY);

            let lineOffset;
            //propagate this movement to all relationship lines
            canvasSelectedDragNode.instance.relationships.forEach((relationship) => {
                if (relationship.capability.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a capability
                    //update line start
                    lineOffset = { x: relationship.lineOffsetPlot[0][0], y: relationship.lineOffsetPlot[0][1]};
                    //maintain the other side in the same position since it's not moving
                    relationship.lineSVG.plot([[dragX + lineOffset.x, dragY + lineOffset.y], relationship.lineSVG.plot()[1]]);
                } else if (relationship.requirement.nodeID === canvasSelectedDragNode.instance.canvasID) { //dragged node has a relationship line towards a requirement
                    //update line end
                    lineOffset = { x: relationship.lineOffsetPlot[1][0], y: relationship.lineOffsetPlot[1][1]};
                    //maintain the other side in the same position since it's not moving
                    relationship.lineSVG.plot([relationship.lineSVG.plot()[0], [dragX + lineOffset.x, dragY + lineOffset.y]]);
                }
            });
        }
    }

    function onMouseClick(event) {
        if (relationshipPreviewLine != null) removeRelationshipPreviewLine();
    }

    return {
        init: function() {
            console.log('%cCreating Canvas...', 'color: #ffc895');

            let canvas = $('#infraRED-ui-canvas');

            let content = $('<div>', {
                id: 'canvas-content',
                class: 'content',
            });

            content.droppable({
                tolerance: 'fit',
                hoverClass: 'canvas-hover-drop',
                accept: '.resource',
                drop: onContentDrop,
            });

            infraRED.events.on('nodes:canvas-drop-success', contentDropSuccess);

            let canvasSVG = document.createElementNS(SVGnamespace, 'svg');
            createCanvasEnvironment(canvasSVG);

            canvasDraw.on('mousemove', onMouseMove);
            canvasDraw.on('click', onMouseClick);

            infraRED.events.on('canvas:create-relationship-connection', createRelationshipConnection);
            infraRED.events.on('canvas:create-relationship-preview-line', createRelationshipPreviewLine);

            content.append(canvasSVG);
            canvas.append(content);
        },
    };
})();