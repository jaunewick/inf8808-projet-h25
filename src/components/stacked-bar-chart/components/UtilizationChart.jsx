import React, { useEffect } from "react";
import * as d3 from "d3";
// import { createTransition } from "../utils/animations";
import { COLORS, FONTS, STYLES } from "../utils/chartStyles";
import "./UtilizationChart.css";

const UtilizationChart = ({ svgRef, data, scales }) => {
  const { x, y2 } = scales;
  const { width, height, margin } = scales;

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Create a group element for the utilization chart
    const svg = d3.select(svgRef.current);
    const utilizationChartGroup = svg
      .append("g")
      .attr("class", "utilization-chart")
      .attr("transform", `translate(${margin.left},${height + margin.top})`);

    // Add background
    utilizationChartGroup
      .append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .attr("fill", "url(#chart-gradient)")
      .attr("rx", 12)
      .attr("ry", 12);

    // Add X axis
    utilizationChartGroup
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("text-anchor", "middle")
      .style("font-size", FONTS.axis.size)
      .style("fill", COLORS.text.primary)
      .style("font-weight", FONTS.axis.weight);

    // Add X axis label
    utilizationChartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 15)
      .style("text-anchor", "middle")
      .style("font-size", FONTS.subtitle.size)
      .style("font-weight", FONTS.subtitle.weight)
      .style("fill", COLORS.text.primary)
      .style("letter-spacing", "0.5px")
      .text("Numéro de canot");

    // Add Y axis
    utilizationChartGroup
      .append("g")
      .call(
        d3
          .axisLeft(y2)
          .ticks(5)
          .tickFormat((d) => `${d}%`)
      )
      .selectAll("text")
      .style("font-size", FONTS.axis.size)
      .style("fill", COLORS.text.primary)
      .style("font-weight", FONTS.axis.weight);

    // Add Y axis label
    utilizationChartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 120)
      .style("text-anchor", "middle")
      .style("font-size", FONTS.subtitle.size)
      .style("font-weight", FONTS.subtitle.weight)
      .style("fill", COLORS.text.primary)
      .style("letter-spacing", "0.5px")
      .text("Taux de remplissage (%)");

    // Add Y grid lines
    utilizationChartGroup
      .append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(y2).ticks(5).tickSize(-width).tickFormat(""))
      .style("stroke-dasharray", STYLES.grid.strokeDasharray)
      .style("opacity", STYLES.grid.opacity)
      .style("stroke", COLORS.grid);

    // Add 100% reference line
    utilizationChartGroup
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", y2(100))
      .attr("y2", y2(100))
      .style("stroke", COLORS.capacity)
      .style("stroke-width", STYLES.capacity.strokeWidth)
      .style("stroke-dasharray", STYLES.capacity.strokeDasharray)
      .style("opacity", STYLES.capacity.opacity);

    // Add reference text
    utilizationChartGroup
      .append("text")
      .attr("x", width + 5)
      .attr("y", y2(100) + 4)
      .style("font-size", FONTS.label.size)
      .style("fill", COLORS.capacity)
      .style("font-weight", FONTS.label.weight)
      .text("Capacité maximale");

    // Add utilization bars
    utilizationChartGroup
      .selectAll(".utilization-bar")
      .data(data, (d) => d.boat)
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "utilization-bar")
            .attr("x", (d) => x(d.boat))
            .attr("y", height)
            .attr("height", 0)
            .attr("width", x.bandwidth())
            .attr("rx", STYLES.bar.rx)
            .attr("ry", STYLES.bar.ry)
            .attr("fill", (d) => {
              if (d.utilization > 100) return COLORS.utilization.over100;
              if (d.utilization > 80) return COLORS.utilization.over80;
              return COLORS.utilization.under80;
            })
            .attr("fill-opacity", 0.7)
            .attr("stroke", (d) => {
              if (d.utilization > 100) return COLORS.utilization.over100;
              if (d.utilization > 80) return COLORS.utilization.over80;
              return COLORS.utilization.under80;
            })
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 1)
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("x", (d) => x(d.boat))
            .attr("y", (d) => y2(d.utilization))
            .attr("height", (d) => height - y2(d.utilization))
            .delay((d, i) => i * 100),
        (update) =>
          update
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("x", (d) => x(d.boat))
            .attr("y", (d) => y2(d.utilization))
            .attr("height", (d) => height - y2(d.utilization))
            .attr("fill", (d) => {
              if (d.utilization > 100) return COLORS.utilization.over100;
              if (d.utilization > 80) return COLORS.utilization.over80;
              return COLORS.utilization.under80;
            })
            .delay((d, i) => i * 100),
        (exit) =>
          exit
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("y", height)
            .attr("height", 0)
            .remove()
      );

    // Add utilization values
    utilizationChartGroup
      .selectAll(".utilization-text")
      .data(data, (d) => d.boat)
      .join(
        (enter) =>
          enter
            .append("text")
            .attr("class", "utilization-text")
            .attr("x", (d) => x(d.boat) + x.bandwidth() / 2)
            .attr("y", height)
            .attr("text-anchor", "middle")
            .style("font-size", FONTS.label.size)
            .style("fill", COLORS.text.primary)
            .style("font-weight", FONTS.label.weight)
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("x", (d) => x(d.boat) + x.bandwidth() / 2)
            .attr("y", (d) => y2(d.utilization) - 5)
            .delay((d, i) => i * 100)
            .text((d) => `${Math.round(d.utilization)}%`),
        (update) =>
          update
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("x", (d) => x(d.boat) + x.bandwidth() / 2)
            .attr("y", (d) => y2(d.utilization) - 5)
            .delay((d, i) => i * 100),
        (exit) =>
          exit
            .transition()
            .duration(1000)
            .ease(d3.easeBounceOut)
            .attr("y", height)
            .remove()
      );

    // Add legend
    const legend = utilizationChartGroup
      .append("g")
      .attr("class", "chart-legend")
      .attr("transform", `translate(${width - 200}, 20)`);

    // Add legend items
    const utilizationLevels = [
      { color: COLORS.utilization.over100, label: "Surcapacité (>100%)" },
      { color: COLORS.utilization.over80, label: "Remplissage élevé (>80%)" },
      { color: COLORS.utilization.under80, label: "Remplissage normal (<80%)" },
    ];

    utilizationLevels.forEach((level, i) => {
      const legendItem = legend
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(100, ${i * 24 - 100})`);

      legendItem
        .append("rect")
        .attr("class", "legend-color")
        .attr("width", 16)
        .attr("height", 16)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", level.color)
        .attr("fill-opacity", 0.7)
        .attr("stroke", level.color)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 1);

      legendItem
        .append("text")
        .attr("class", "legend-text")
        .attr("x", 24)
        .attr("y", 12)
        .style("font-size", FONTS.label.size)
        .style("fill", COLORS.text.primary)
        .style("font-weight", FONTS.label.weight)
        .text(level.label);
    });

    return () => {
      // Cleanup function
      utilizationChartGroup.remove();
    };
  }, [svgRef, data, scales]);

  return null;
};

export default UtilizationChart;
