import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

import { drawAxes, drawBoxplots, drawMedianLines, drawJitterPoints, drawAnnotations, drawLegend } from "../../utils/drawUtils/BoxplotSurvivalDraw";

function BoxplotSurvival({ data, active }) {
  const svgRef = useRef();
  const margin = { top: 40, right: 30, bottom: 80, left: 60 };
  const width = 1150 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  useEffect(() => {
    if (!data || !active) return;

    const processedData = preprocessData(data);
    const sumstat = calculateStatistics(processedData);
    const svg = initializeSVG();
    const chart = createChartGroup(svg);
    const { xScale, yScale } = createScales(processedData);

    drawAxes(chart, xScale, yScale, width, height, margin);
    drawBoxplots(chart, sumstat, xScale, yScale);
    drawMedianLines(chart, sumstat, xScale, yScale, height);
    drawJitterPoints(chart, processedData, xScale, yScale, height);
    drawAnnotations(chart, sumstat, processedData, xScale, height);
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
        survived: d.survived === "yes" ? "oui" : "non",
        fare: +d.fare,
        class: d.class,
      }));
  };

  const calculateStatistics = (processedData) => {
    const sumstat = d3.group(processedData, (d) => d.survived);
    sumstat.forEach((group, key) => {
      const values = group.map((d) => d.fare).sort(d3.ascending);
      const q1 = d3.quantile(values, 0.25);
      const median = d3.quantile(values, 0.5);
      const q3 = d3.quantile(values, 0.75);
      const iqr = q3 - q1;

      sumstat.set(key, {
        q1,
        median,
        q3,
        lowerFence: d3.max([values[0], q1 - 1.5 * iqr]),
        upperFence: d3.min([values[values.length - 1], q3 + 1.5 * iqr]),
        min: values[0],
        max: values[values.length - 1],
        outliers: values.filter(
          (d) => d < q1 - 1.5 * iqr || d > q3 + 1.5 * iqr,
        ),
      });
    });
    return sumstat;
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

  const createScales = (processedData) => {
    const xScale = d3
      .scaleBand()
      .domain(["oui", "non"])
      .range([0, width])
      .paddingInner(0.5)
      .paddingOuter(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, (d) => d.fare) + 20])
      .range([height, 0]);

    return { xScale, yScale };
  };

  return (
    <div className="maritime-bulletin">
      <div className="boxplot-survival" style={{ position: "relative" }}>
        <svg
          ref={svgRef}
          width={width + margin.left + margin.right}
          height={height + margin.top + margin.bottom}
        />
      </div>
    </div>
  );
}

export default BoxplotSurvival;