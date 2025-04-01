import * as d3 from "d3";
import React, { useEffect, useRef } from "react";

/**
 * @typedef {Object} PieChartProps
 * @property {{ label: string, value: number }[]} data
 * @property {number} width
 * @property {number} height
 * @property {string[]} [colors]
 * @property {'pie' | 'donut'} [variant]
 */

/**
 * @param {PieChartProps} props
 */

export const PieChart = ({ data, width, height, colors, variant = "pie" }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const radius = Math.min(width, height) / 2;
    const innerRadius = variant === "donut" ? radius / 2.5 : 0;
    const color = d3.scaleOrdinal(colors || d3.schemeCategory10);

    const pie = d3.pie().value((d) => d.value)(data);
    const arc = d3.arc().innerRadius(innerRadius).outerRadius(radius);

    const svg = d3.select(ref.current);
    svg.selectAll("*").remove(); // enlever les anciens éléments

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    g.selectAll("path")
      .data(pie)
      .enter()
      .append("path")
      .attr("d", arc)
      .attr("fill", (d, i) => color(i))
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    g.selectAll("text")
      .data(pie)
      .enter()
      .append("text")
      .text((d) => d.data.label)
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", 12);
  }, [data, width, height, colors, variant]);

  return <svg ref={ref}></svg>;
};
