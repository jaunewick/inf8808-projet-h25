import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import "./StackedBarChart.css";

const StackedBarChart = ({ data }) => {
  const svgRef1 = useRef();
  const svgRef2 = useRef();
  const containerRef = useRef();
  const [sortBy, setSortBy] = useState("time"); // "time" or "capacity"
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Clear any existing SVG content
    d3.select(svgRef1.current).selectAll("*").remove();
    d3.select(svgRef2.current).selectAll("*").remove();

    // Set up the dimensions
    const margin = { top: 120, right: 10, bottom: 80, left: 180 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    // Process the data
    const processedData = data.map((d) => ({
      boat: d.boat,
      crew: parseInt(d.crew) || 0,
      men: parseInt(d.men) || 0,
      women: parseInt(d.women) || 0,
      capacity: parseInt(d.cap) || 0,
      time: new Date(d.launch),
      total: parseInt(d.total) || 0,
      utilization: (parseInt(d.total) / parseInt(d.cap)) * 100,
      overload: Math.max(0, parseInt(d.total) - parseInt(d.cap)),
      remaining: Math.max(0, parseInt(d.cap) - parseInt(d.total)),
    }));

    // Sort data based on current sort criteria
    const sortedData = [...processedData].sort((a, b) => {
      if (sortBy === "time") {
        return a.time - b.time;
      } else {
        return a.utilization - b.utilization;
      }
    });

    // Define the keys for stacking
    const keys = ["crew", "men", "women", "overload", "remaining"];

    // Create scales for the first chart (time-based)
    const xTime = d3
      .scaleBand()
      .domain(sortedData.map((d, i) => i))
      .range([0, width])
      .padding(0.1);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, (d) => Math.max(d.capacity, d.total))])
      .range([height, 0]);

    // Create scales for the second chart (boat-based)
    const x = d3
      .scaleBand()
      .domain(sortedData.map((d) => d.boat))
      .range([0, width])
      .padding(0.1);

    const y2 = d3.scaleLinear().domain([0, 110]).range([height, 0]);

    // Create color scale with more vibrant colors
    const color = d3
      .scaleOrdinal()
      .domain(keys)
      .range(["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#f5f5f5"]);

    // Function to create a chart
    const createChart = (svgRef, title, subtitle, isUtilization = false) => {
      const svg = d3
        .select(svgRef)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height * 2)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);
      svg
        .append("rect")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .attr("fill", "url(#chart-gradient)")
        .attr("rx", 12)
        .attr("ry", 12);

      if (!isUtilization) {
        // FIRST CHART - Time-based X axis
        const xAxis = d3
          .axisBottom(xTime)
          .tickFormat((d) => {
            if (d >= 0 && d < sortedData.length) {
              const time = sortedData[d].time;
              return time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              });
            }
            return "";
          })
          .tickSize(-height)
          .tickPadding(10);

        svg
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(xAxis)
          .selectAll("text")
          .style("text-anchor", "end")
          .style("font-size", "12px")
          .style("fill", "#374151")
          .style("font-weight", "500")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", "rotate(-45)");

        // Add X axis label with modern styling
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom + 15)
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("fill", "#374151")
          .style("letter-spacing", "0.5px")
          .text("Heure de départ (HH:MM)");

        // Add Y axis with modern styling
        svg
          .append("g")
          .call(d3.axisLeft(y))
          .selectAll("text")
          .style("font-size", "12px")
          .style("fill", "#374151")
          .style("font-weight", "500");

        // Add Y axis label with modern styling
        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -margin.left + 120)
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("fill", "#374151")
          .style("letter-spacing", "0.5px")
          .text("Nombre de personnes");

        // Add Y grid lines with modern styling
        svg
          .append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""))
          .style("stroke-dasharray", "3,3")
          .style("opacity", 0.1)
          .style("stroke", "#374151");

        // Stack the data
        const stack = d3.stack().keys(keys);
        const stackedData = stack(sortedData);

        // Create the stacked bars with smooth transitions
        const barsGroup = svg
          .append("g")
          .selectAll("g")
          .data(stackedData)
          .join("g")
          .attr("fill", (d) => color(d.key))
          .selectAll("rect")
          .data((d) => d.map((value, i) => ({ key: d.key, value, index: i })))
          .join("rect")
          .attr("x", (d) => xTime(d.index))
          .attr("y", (d) => y(d.value[1]))
          .attr("height", (d) => y(d.value[0]) - y(d.value[1]))
          .attr("width", xTime.bandwidth())
          .attr("rx", 4)
          .attr("ry", 4)
          .style("transition", "all 0.5s ease-in-out");

        // Add transition for bars
        barsGroup
          .transition()
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr("x", (d) => xTime(d.index))
          .attr("y", (d) => y(d.value[1]))
          .attr("height", (d) => y(d.value[0]) - y(d.value[1]));

        // Add hover effects
        barsGroup
          .on("mouseover", function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 0.8)
              .attr("filter", "brightness(1.1)");

            const boatData = sortedData[d.index];
            const tooltip = svg
              .append("g")
              .attr("class", "tooltip")
              .attr(
                "transform",
                `translate(${xTime(d.index) + xTime.bandwidth() / 2}, ${
                  y(d.value[1]) - 10
                })`
              );

            const tooltipText = [
              `Boat #${boatData.boat}`,
              `${d.key.charAt(0).toUpperCase() + d.key.slice(1)}: ${Math.round(
                d.value[1] - d.value[0]
              )}`,
              `Total: ${boatData.total}/${boatData.capacity}`,
              `Time: ${boatData.time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            ].join("\n");

            const textElement = tooltip
              .append("text")
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .style("fill", "#ffffff")
              .style("font-weight", "500")
              .text(tooltipText);

            const bbox = textElement.node().getBBox();
            tooltip
              .insert("rect", "text")
              .attr("width", bbox.width + 24)
              .attr("height", bbox.height + 16)
              .attr("x", -bbox.width / 2 - 12)
              .attr("y", -bbox.height / 2 - 8)
              .attr("fill", "#1f2937")
              .attr("rx", 6)
              .attr("ry", 6)
              .attr("opacity", 0.95)
              .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 1)
              .attr("filter", "none");
            svg.selectAll(".tooltip").remove();
          });

        // Add capacity lines with smooth transitions
        const capacityLines = svg
          .selectAll(".capacity-line")
          .data(sortedData)
          .join("line")
          .attr("class", "capacity-line")
          .attr("x1", (d, i) => xTime(i))
          .attr("x2", (d, i) => xTime(i) + xTime.bandwidth())
          .attr("y1", (d) => y(d.capacity))
          .attr("y2", (d) => y(d.capacity))
          .attr("stroke", "#374151")
          .attr("stroke-width", 2)
          .attr("stroke-dasharray", "4,4")
          .attr("opacity", 0.3)
          .style("transition", "all 0.5s ease-in-out");

        // Add transition for capacity lines
        capacityLines
          .transition()
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr("x1", (d, i) => xTime(i))
          .attr("x2", (d, i) => xTime(i) + xTime.bandwidth())
          .attr("y1", (d) => y(d.capacity))
          .attr("y2", (d) => y(d.capacity));

        // Add boat number labels with smooth transitions
        const boatLabels = svg
          .selectAll(".boat-label")
          .data(sortedData)
          .join("text")
          .attr("class", "boat-label")
          .attr("x", (d, i) => xTime(i) + xTime.bandwidth() / 2)
          .attr("y", (d) => y(d.total) - 10)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("font-weight", "600")
          .style("fill", "#374151")
          .style("transition", "all 0.5s ease-in-out")
          .text((d) => `#${d.boat}`);

        // Add transition for boat labels
        boatLabels
          .transition()
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr("x", (d, i) => xTime(i) + xTime.bandwidth() / 2)
          .attr("y", (d) => y(d.total) - 10);
      } else {
        // SECOND CHART - Boat-based X axis with modern styling
        svg
          .append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x))
          .selectAll("text")
          .style("text-anchor", "middle")
          .style("font-size", "12px")
          .style("fill", "#374151")
          .style("font-weight", "500");

        // Add X axis label with modern styling
        svg
          .append("text")
          .attr("x", width / 2)
          .attr("y", height + margin.bottom - 15)
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("fill", "#374151")
          .style("letter-spacing", "0.5px")
          .text("Numéro de bateau");

        // Add Y axis with grid lines and modern styling
        svg
          .append("g")
          .call(
            d3
              .axisLeft(y2)
              .ticks(5)
              .tickFormat((d) => `${d}%`)
          )
          .selectAll("text")
          .style("font-size", "12px")
          .style("fill", "#374151")
          .style("font-weight", "500");

        // Add Y axis label with modern styling
        svg
          .append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -height / 2)
          .attr("y", -margin.left + 120)
          .style("text-anchor", "middle")
          .style("font-size", "14px")
          .style("font-weight", "600")
          .style("fill", "#374151")
          .style("letter-spacing", "0.5px")
          .text("Taux de remplissage (%)");

        // Add Y grid lines with modern styling
        svg
          .append("g")
          .attr("class", "grid")
          .call(d3.axisLeft(y2).ticks(5).tickSize(-width).tickFormat(""))
          .style("stroke-dasharray", "3,3")
          .style("opacity", 0.1)
          .style("stroke", "#374151");

        // Add 100% reference line with modern styling
        svg
          .append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y2(100))
          .attr("y2", y2(100))
          .style("stroke", "#d0021b")
          .style("stroke-width", 1.5)
          .style("stroke-dasharray", "3,3")
          .style("opacity", 0.5);

        // Add reference text with modern styling
        svg
          .append("text")
          .attr("x", width + 5)
          .attr("y", y2(100) + 4)
          .style("font-size", "10px")
          .style("fill", "#d0021b")
          .style("font-weight", "500")
          .text("Full Capacity");

        // Add utilization bars with smooth transitions
        const utilizationBarsGroup = svg
          .selectAll(".utilization-bar")
          .data(sortedData)
          .join("rect")
          .attr("class", "utilization-bar")
          .attr("x", (d) => x(d.boat))
          .attr("y", (d) => y2(d.utilization))
          .attr("height", (d) => height - y2(d.utilization))
          .attr("width", x.bandwidth())
          .attr("rx", 4)
          .attr("ry", 4)
          .attr("fill", (d) => {
            if (d.utilization > 100) return "#ef4444";
            if (d.utilization > 80) return "#f59e0b";
            return "#10b981";
          })
          .attr("stroke", "white")
          .attr("stroke-width", 0.5)
          .style("transition", "all 0.5s ease-in-out");

        // Add transition for utilization bars
        utilizationBarsGroup
          .transition()
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr("x", (d) => x(d.boat))
          .attr("y", (d) => y2(d.utilization))
          .attr("height", (d) => height - y2(d.utilization));

        // Add hover effects for utilization bars
        utilizationBarsGroup
          .on("mouseover", function (event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 0.8)
              .attr("filter", "brightness(1.1)");

            const tooltip = svg
              .append("g")
              .attr("class", "tooltip")
              .attr(
                "transform",
                `translate(${x(d.boat) + x.bandwidth() / 2}, ${
                  y2(d.utilization) - 15
                })`
              );

            const tooltipText = [
              `Boat #${d.boat}`,
              `Fill Rate: ${Math.round(d.utilization)}%`,
              `Total: ${d.total}/${d.capacity}`,
              `Time: ${d.time.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}`,
            ].join("\n");

            const textElement = tooltip
              .append("text")
              .attr("text-anchor", "middle")
              .style("font-size", "12px")
              .style("fill", "#ffffff")
              .style("font-weight", "500")
              .text(tooltipText);

            const bbox = textElement.node().getBBox();
            tooltip
              .insert("rect", "text")
              .attr("width", bbox.width + 24)
              .attr("height", bbox.height + 16)
              .attr("x", -bbox.width / 2 - 12)
              .attr("y", -bbox.height / 2 - 8)
              .attr("fill", "#1f2937")
              .attr("rx", 6)
              .attr("ry", 6)
              .attr("opacity", 0.95)
              .attr("filter", "drop-shadow(0 2px 4px rgba(0,0,0,0.2))");
          })
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("opacity", 1)
              .attr("filter", "none");
            svg.selectAll(".tooltip").remove();
          });

        // Add utilization values with smooth transitions
        const utilizationTexts = svg
          .selectAll(".utilization-text")
          .data(sortedData)
          .join("text")
          .attr("class", "utilization-text")
          .attr("x", (d) => x(d.boat) + x.bandwidth() / 2)
          .attr("y", (d) => y2(d.utilization) - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "#374151")
          .style("font-weight", "600")
          .style("transition", "all 0.5s ease-in-out")
          .text((d) => `${Math.round(d.utilization)}%`);

        // Add transition for utilization texts
        utilizationTexts
          .transition()
          .duration(800)
          .ease(d3.easeCubicInOut)
          .attr("x", (d) => x(d.boat) + x.bandwidth() / 2)
          .attr("y", (d) => y2(d.utilization) - 5);
      }

      // Add title with modern styling
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -30)
        .attr("text-anchor", "middle")
        .style("font-size", "18px")
        .style("font-weight", "bold")
        .style("fill", "#374151")
        .style("letter-spacing", "0.5px")
        .style("text-transform", "uppercase")
        .attr("transform", `translate(0, ${-margin.top})`)
        .text(title);

      // Add subtitle with modern styling
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#666")
        .style("font-weight", "500")
        .attr("transform", `translate(0, ${-margin.top})`)
        .text(subtitle);

      // Add legend with modern styling
      const legendData = isUtilization
        ? [
            { key: "Under 80%", color: "#7ed321" },
            { key: "80-100%", color: "#f5a623" },
            { key: "Over 100%", color: "#d0021b" },
          ]
        : keys.map((key) => ({ key, color: color(key) }));

      const legend = svg
        .append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width + 50}, 50)`)
        .selectAll("g")
        .data(legendData)
        .join("g")
        .attr("transform", (d, i) => `translate(0, ${i * 25})`);

      legend
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", (d) => d.color)
        .attr("rx", 50)
        .attr("ry", 50);

      legend
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", "0.32em")
        .style("font-size", "12px")
        .style("fill", "#374151")
        .style("font-weight", "500")
        .text((d) => {
          const key = d.key;
          return key.charAt(0).toUpperCase() + key.slice(1);
        });
    };

    // Create both charts
    createChart(
      svgRef1.current,
      "Occupation des embarcations par heure de départ",
      "Distribution des équipages, hommes, femmes et surcharge dans chaque embarcation"
    );
    createChart(
      svgRef2.current,
      "Taux de remplissage des embarcations",
      "Pourcentage de la capacité utilisée dans chaque embarcation",
      true
    );
  }, [data, sortBy]);

  // Add scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      const container = containerRef.current;
      const scrollPosition = container.scrollTop;
      const containerHeight = container.clientHeight;

      // Calculate which chart is more visible with a more gradual transition
      const firstChartHeight = containerHeight / 2;
      const scrollRatio = scrollPosition / firstChartHeight;

      // Add a delay before updating the sort
      scrollTimeoutRef.current = setTimeout(() => {
        // Use a more gradual threshold for the transition
        if (scrollRatio < 0.6) {
          setSortBy("time");
        } else if (scrollRatio > 0.7) {
          setSortBy("capacity");
        }
      }, 150); // 150ms delay for smoother transition
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => {
        container.removeEventListener("scroll", handleScroll);
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
      };
    }
  }, []);

  return (
    <div className="stacked-bar-charts" ref={containerRef}>
      <div className="stacked-bar-chart">
        <svg ref={svgRef1}></svg>
      </div>
      <div className="stacked-bar-chart">
        <svg ref={svgRef2}></svg>
      </div>
    </div>
  );
};

export default StackedBarChart;
