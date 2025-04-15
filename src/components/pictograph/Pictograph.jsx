import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { standingPerson } from '../../assets/standingPerson';
import './Pictograph.css';

const Pictograph = ({ value, isSmaller=true }) => {
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
      .attr('width', isSmaller ? 350 : 550)
      .attr('height', isSmaller ? 100 : 200)
      
      const tooltip = d3.select(containerRef.current)
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("background", "#fff")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("border", "1px solid gray")
        .style("font-size", "12px")
        .style("pointer-events", "none")
        .style("opacity", 0)

      svgDoc
        .on("mouseover", () => {
          tooltip
            .style("opacity", 0.9)
            .html(`Chance de survie : ${Math.round(value * 10)} %`)
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", `${event.layerX + 20}px`)
            .style("top", `${event.layerY - 25}px`);
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

    const scale = isSmaller ? 0.6 : 1;

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
    const wBuffer = isSmaller ? 50 : 55;
    const myIndex = d3.range(numCols * numRows);

    svgDoc.append('g')
      .attr('id', `pictoLayer${text}`)
      .selectAll('use')
      .data(myIndex)
      .enter()
      .append('use')
      .attr('transform', () => {
        return `scale(${scale})`;
      })
      .attr('href', `#iconCustom${text}`)
      .attr('id', (d) => `icon${text}${d}`)
      .attr('x', (d) => {
        const remainder = d % numCols;
        return xPadding + (remainder * wBuffer);
      })
      .attr('y', (d) => {
        const whole = Math.floor(d / numCols);
        return yPadding + (whole * hBuffer);
      })
      .attr('class', (d) => (d < Math.round(value) ? 'iconSelected' : 'iconPlain'));
  };  

  return (
    <div ref={containerRef}></div>
  );
};

export default Pictograph;
