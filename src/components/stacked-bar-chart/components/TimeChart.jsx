import React, { useEffect } from "react";
import * as d3 from "d3";
import { COLORS, FONTS, STYLES } from "../utils/chartStyles";
import "./TimeChart.css";

const TimeChart = ({ svgRef, data, scales }) => {
  const { xTime, y, color, keys, width, height, margin } = scales;

  useEffect(() => {
    if (!svgRef.current || !data) return;

    // Create a group element for the time chart
    const svg = d3.select(svgRef.current);
    const timeChartGroup = svg
      .append("g")
      .attr("class", "time-chart")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add background
    timeChartGroup
      .append("rect")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height)
      .attr("fill", "url(#chart-gradient)")
      .attr("rx", 12)
      .attr("ry", 12);

    // Add X axis
    timeChartGroup
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3.axisBottom(xTime).tickFormat((d) => {
          if (d >= 0 && d < data.length) {
            const time = data[d].time;
            return time.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          return "";
        })
      )
      .selectAll("text")
      .style("text-anchor", "end")
      .style("font-size", FONTS.axis.size)
      .style("fill", COLORS.text.primary)
      .style("font-weight", FONTS.axis.weight)
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    // Add X axis label
    timeChartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom + 15)
      .style("text-anchor", "middle")
      .style("font-size", FONTS.subtitle.size)
      .style("font-weight", FONTS.subtitle.weight)
      .style("fill", COLORS.text.primary)
      .style("letter-spacing", "0.5px")
      .text("Heure de départ (HH:MM)");

    // Add Y axis
    timeChartGroup
      .append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .style("font-size", FONTS.axis.size)
      .style("fill", COLORS.text.primary)
      .style("font-weight", FONTS.axis.weight);

    // Add Y axis label
    timeChartGroup
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 120)
      .style("text-anchor", "middle")
      .style("font-size", FONTS.subtitle.size)
      .style("font-weight", FONTS.subtitle.weight)
      .style("fill", COLORS.text.primary)
      .style("letter-spacing", "0.5px")
      .text("Nombre de personnes");

    // Stack the data
    const stack = d3.stack().keys(keys); // keys = ["Équipage", "Hommes", "Femmes", "Surcapacité", "Reste"]
    const stackedData = stack(data);
    // Create the stacked bars with initial state
    const barsGroup = timeChartGroup
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .join("g")
      .attr("fill", (d) => color(d.key))
      .attr("fill-opacity", 0.9)
      .selectAll("rect")
      .data((d) => d.map((value, i) => ({ key: d.key, value, index: i })))
      .join("rect")
      .attr("x", (d) => xTime(d.index))
      .attr("y", height) // Start from bottom
      .attr("height", 0) // Start with height 0
      .attr("width", xTime.bandwidth());

    // Animate bars to their final positions
    barsGroup
      .transition()
      .duration(1000)
      .ease(d3.easeCircle)
      .attr("x", (d) => xTime(d.index))
      .attr("y", (d) => y(d.value[1]))
      .attr("height", (d) => y(d.value[0]) - y(d.value[1]))
      .delay((d, i) => i * 100);

    // Add hover effects
    barsGroup
      .on("mouseover", function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("filter", "brightness(2)");

        const boatData = data[d.index];
        const tooltip = timeChartGroup
          .append("g")
          .attr("class", "tooltip")
          .attr(
            "transform",
            `translate(${xTime(d.index) + xTime.bandwidth() / 2}, ${
              y(d.value[1]) - 10
            })`
          );

        // Create tooltip background first
        const tooltipGroup = tooltip.append("g");

        // Add each line of text separately
        const lines = [
          `Bateau #${boatData.boat}`,
          `Total: ${boatData.total}/${boatData.capacity}`,
          `Hommes: ${boatData.men}`,
          `Femmes: ${boatData.women}`,
          `Equipage: ${boatData.crew}`,
          `Surcharge: ${
            boatData.total > boatData.capacity
              ? `+${boatData.total - boatData.capacity}`
              : "0"
          }`,
          `Heure de départ: ${boatData.time.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}`,
        ];

        // Add each line of text
        lines.forEach((line, i) => {
          tooltipGroup
            .append("text")
            .attr("text-anchor", "right")
            .attr("x", 0)
            .attr("y", i * 20) // 20px spacing between lines
            .style("font-size", FONTS.tooltip.size)
            .style("fill", COLORS.text.primary)
            .style("font-weight", FONTS.tooltip.weight)
            .text(line);
        });

        // Get the bounding box of all text elements
        const bbox = tooltipGroup.node().getBBox();

        // Add background rectangle
        tooltip
          .insert("rect", "g")
          .attr("width", bbox.width + STYLES.tooltip.padding)
          .attr("height", bbox.height + STYLES.tooltip.padding)
          .attr("x", -bbox.width + 130)
          .attr("y", -bbox.height + 105)
          .attr("fill", COLORS.text.primary)
          .attr("rx", STYLES.tooltip.rx)
          .attr("ry", STYLES.tooltip.ry)
          .attr("opacity", STYLES.tooltip.opacity)
          .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
      })
      .on("mouseout", function () {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("filter", "none");
        timeChartGroup.selectAll(".tooltip").remove();
      });

    // Add capacity lines with smooth transitions
    const capacityLines = timeChartGroup
      .selectAll(".capacity-line")
      .data(data)
      .join("line")
      .attr("class", "capacity-line")
      .attr("x1", (d, i) => xTime(i))
      .attr("x2", (d, i) => xTime(i) + xTime.bandwidth())
      .attr("y1", (d) => y(d.capacity))
      .attr("y2", (d) => y(d.capacity))
      .attr("stroke", COLORS.capacity)
      .attr("stroke-width", STYLES.capacity.strokeWidth)
      .attr("stroke-dasharray", STYLES.capacity.strokeDasharray)
      .attr("opacity", STYLES.capacity.opacity);

    // Add transition for capacity lines
    capacityLines
      .transition()
      .duration(1000)
      .ease(d3.easeBounceOut)
      .attr("x1", (d, i) => xTime(i))
      .attr("x2", (d, i) => xTime(i) + xTime.bandwidth())
      .attr("y1", (d) => y(d.capacity))
      .attr("y2", (d) => y(d.capacity));

    // Add title
    timeChartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", FONTS.title.size)
      .style("font-weight", FONTS.title.weight)
      .style("fill", COLORS.text.primary)
      .style("letter-spacing", "0.5px")
      .style("text-transform", "uppercase")
      .attr("transform", `translate(0, ${-margin.top})`)
      .text("Distribution des passagers par bateau");

    // Add subtitle
    timeChartGroup
      .append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", FONTS.subtitle.size)
      .style("fill", COLORS.text.secondary)
      .style("font-weight", FONTS.subtitle.weight)
      .attr("transform", `translate(0, ${-margin.top})`)
      .text("Nombre de personnes");

    // Add legend
    const legend = timeChartGroup
      .append("g")
      .attr("class", "chart-legend")
      .attr("transform", `translate(${width + 50}, 20)`);

    // Add legend items
    scales.keys.forEach((key, i) => {
      const legendItem = legend
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(0, ${i * 24})`);

      legendItem
        .append("rect")
        .attr("class", "legend-color")
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("fill", color(key))
        .attr("fill-opacity", 0.7)
        .attr("stroke", color(key))
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
        .text(() => {
          const translations = {
            crew: "Équipage",
            men: "Hommes",
            women: "Femmes",
            overload: "Surcapacité",
            remaining: "Reste",
          };
          return (
            translations[key] || key.charAt(0).toUpperCase() + key.slice(1)
          );
        });
    });

    return () => {
      // Cleanup function
      timeChartGroup.remove();
    };
  }, [svgRef, data, scales]);
  return null;
};

export default TimeChart;
