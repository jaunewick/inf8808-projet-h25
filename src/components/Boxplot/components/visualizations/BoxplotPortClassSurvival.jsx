import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import {
  drawAxes,
  drawBoxplots,
  drawMedianLines,
  drawJitterPoints,
  drawAnnotations,
  drawChartLabels,
  drawLegend
} from "../../utils/drawUtils/BoxplotPortClassSurvivalDraw";

function BoxplotPortClassSurvival({ data, active }) {
  const svgRef = useRef();
  const margin = { top: 40, right: 40, bottom: 150, left: 60 };
  const width = 1200 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || !active) return;

    const processedData = preprocessData(data);
    const ports = Array.from(new Set(processedData.map((d) => d.port)));
    const sumstat = d3.group(
      processedData,
      (d) => d.port,
      (d) => d.class,
      (d) => d.survived
    );

    const svg = initializeSVG();
    const chart = createChartGroup(svg);
    const portWidth = width / ports.length - 20;

    ports.forEach((port, i) => {
      const portGroup = chart
        .append("g")
        .attr("transform", `translate(${i * (portWidth + 20)}, 0)`);

      const portData = sumstat.get(port);
      let classNames = Array.from(portData.keys());
      classNames = classNames.sort((a, b) => {
        const order = ["3ème", "2ème", "1ère"];
        return order.indexOf(a) - order.indexOf(b);
      });
      const survivalStatus = ["oui", "non"];

      const { xScale, yScale, colorScale } = createScales(
        processedData,
        classNames,
        portWidth
      );

      drawAxes(
        portGroup,
        xScale,
        yScale,
        port,
        portWidth,
        height
      );
      drawBoxplots(
        portGroup,
        portData,
        xScale,
        yScale,
        colorScale,
        survivalStatus,
        port
      );
      drawMedianLines(
        portGroup,
        portData,
        xScale,
        yScale,
        colorScale,
        survivalStatus,
        height
      );
      drawJitterPoints(
        portGroup,
        portData,
        xScale,
        yScale,
        colorScale,
        survivalStatus,
        port,
        height
      );
      drawAnnotations(
        portGroup,
        processedData,
        port,
        height,
        portWidth
      );
    });

    drawChartLabels(
      chart,
      width,
      height,
      margin,
      ports
    );
    drawLegend(svg, width, margin);
  }, [data, active, height, margin.left, margin.top, width]);

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
          !isNaN(d.fare)
      )
      .map((d) => ({
        port:
          d.embarked === "C"
            ? "Cherbourg"
            : d.embarked === "Q"
              ? "Queenstown"
              : "Southampton",
        survived: d.survived === "yes" ? "oui" : "non",
        class:
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

  const createScales = (processedData, classNames, portWidth) => {
    const xScale = d3
      .scaleBand()
      .domain(classNames)
      .range([0, portWidth])
      .paddingInner(0.1)
      .paddingOuter(0.05);

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
      <div className="boxplot-port-class-survival" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
        />
      </div>
    </div>
  );
}

export default BoxplotPortClassSurvival;
