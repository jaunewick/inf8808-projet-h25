import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import {
  drawAxes,
  drawBoxplots,
  drawMedianLines,
  drawJitterPoints,
  drawAnnotations,
  drawLegend
} from "../utils/drawUtils/BoxplotClassSurvivalDraw";

const BoxplotClassSurvival = ({ data, active }) => {
  const svgRef = useRef();
  const margin = { top: 40, right: 30, bottom: 120, left: 60 };
  const width = 1150 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || !active) return;

    const processedData = preprocessData(data);
    const sumstat = d3.group(
      processedData,
      (d) => d.classed,
      (d) => d.survived,
    );
    const classNames = Array.from(sumstat.keys());
    const survivalStatus = ["oui", "non"];

    const svg = initializeSVG();
    const chart = createChartGroup(svg);
    const { xScale, yScale, colorScale } = createScales(
      processedData,
      classNames
    );

    drawAxes(
      chart,
      xScale,
      yScale,
      width,
      height,
      margin
    );
    drawBoxplots(
      chart,
      sumstat,
      xScale,
      yScale,
      colorScale,
      survivalStatus
    );
    drawMedianLines(
      chart,
      sumstat,
      xScale,
      yScale,
      colorScale,
      survivalStatus,
      height
    );
    drawJitterPoints(
      chart,
      sumstat,
      xScale,
      yScale,
      colorScale,
      survivalStatus,
      height
    );
    drawAnnotations(
      chart,
      sumstat,
      classNames,
      xScale,
      height
    );
    drawLegend(svg, width, margin);
  }, [data, active]);

  const preprocessData = (data) => {
    const excludedClasses = [
      "engineering crew",
      "victualling crew",
      "restaurant staff",
      "deck crew",
    ];
    return data
      .filter(
        (d) =>
          d.embarked !== "B" &&
          d.class &&
          d.fare &&
          !excludedClasses.includes(d.class) &&
          !isNaN(d.fare),
      )
      .map((d) => ({
        class: d.class,
        survived: d.survived === "yes" ? "oui" : "non",
        classed:
          d.class === "1st"
            ? "1ère"
            : d.class === "2nd"
              ? "2ème"
              : d.class === "3rd"
                ? "3ème"
                : d.class,
        fare: +d.fare,
      }));
  };

  const initializeSVG = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    return svg;
  };

  const createChartGroup = (svg) => {
    return svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  };

  const createScales = (processedData, classNames) => {
    const xScale = d3
      .scaleBand()
      .domain(classNames)
      .range([0, width])
      .paddingInner(0.4)
      .paddingOuter(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.fare) + 20])
      .range([height, 0]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(["oui", "non"])
      .range(["#1D3557", "#E63946"]);

    return { xScale, yScale, colorScale };
  };

  return (
    <div className="maritime-bulletin">
      <div className="boxplot-class-survival" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
        />
      </div>
    </div>
  );
};

export default BoxplotClassSurvival;
