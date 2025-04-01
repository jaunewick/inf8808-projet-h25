import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { standingPerson } from '../../assets/standingPerson';
import './Pictograph.css';

const Pictograph = ({ value }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      d3.select(containerRef.current).selectAll('svg').remove();
    }
    
    createVisualization('default', value);
  }, [value]);

  const createVisualization = (text, value) => {
    const svgDoc = d3.select(containerRef.current)
      .append('svg')
      .attr('width', 600)
      .attr('height', 130);

    svgDoc.append('defs')
      .append('g')
      .attr('id', `iconCustom${text}`)
      .append('path')
      .attr('d', standingPerson);
    
    const numCols = 10;
    const numRows = 1;
    const xPadding = 0;
    const yPadding = 5;
    const hBuffer = 0;
    const wBuffer = 55;
    const myIndex = d3.range(numCols * numRows);

    svgDoc.append('g')
      .attr('id', `pictoLayer${text}`)
      .selectAll('use')
      .data(myIndex)
      .enter()
      .append('use')
      .attr('xlink:href', `#iconCustom${text}`)
      .attr('id', (d) => `icon${text}${d}`)
      .attr('x', (d) => {
        const remainder = d % numCols;
        return xPadding + (remainder * wBuffer);
      })
      .attr('y', (d) => {
        const whole = Math.floor(d / numCols);
        return yPadding + (whole * hBuffer);
      })
      .attr('class', (d) => (d < value ? 'iconSelected' : 'iconPlain'));
  };  

  return (
    <div ref={containerRef}></div>
  );
};

export default Pictograph;
