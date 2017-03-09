import * as d3 from 'd3';

import { height, width } from './constants';
import { focus, map, zoomExtent } from './elements';

// save for coordinating in other handlers
let brush, zoom;

const brushMap = (area, { focusX, mapX }) => {
    const brushed = () => {
        // ignore brush-by-zoom
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return;
        const scale = d3.event.selection || mapX.range();
        focusX.domain(scale.map(mapX.invert, mapX));
        focus.selectAll('path').attr('d', area);
        zoomExtent.call(zoom.transform, d3.zoomIdentity
            .scale(width / (scale[1] - scale[0]))
            .translate(-scale[0], 0));
    };

    const mapBox = map.node().getBBox();
    brush = d3.brushX()
        .extent([[mapBox.x, mapBox.y], [mapBox.width, mapBox.y + mapBox.height]])
        .on('brush', brushed);

    map.append('g')
        .attr('class', 'brush')
        .call(brush);
};

const zoomFocus = (area, { focusX, mapX }) => {
    const zoomed = () => {
        // ignore zoom-by-brush
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return;
        const transform = d3.event.transform;
        focusX.domain(transform.rescaleX(mapX).domain());
        focus.selectAll('path').attr('d', area);
        d3.select('.brush').call(brush.move, mapX.range().map(transform.invertX, transform));
    };

    zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    const focusBox = focus.node().getBBox();
    zoomExtent
        .attr('x', focusBox.x)
        .attr('y', focusBox.y)
        .attr('width', focusBox.width)
        .attr('height', focusBox.height)
        .call(zoom);
};

export { brushMap, zoomFocus };