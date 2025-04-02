import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import TimeChart from "./components/TimeChart";
import UtilizationChart from "./components/UtilizationChart";
import { createScales } from "./utils/scales";
import { COLORS, FONTS, STYLES } from "./utils/chartStyles";
import "./StackedBarChart.css";

const StackedBarChart = ({ data }) => {
  const timeChartRef = useRef();
  const utilizationChartRef = useRef();
  const [currentSort, setCurrentSort] = useState("time");
  const [scales, setScales] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const ratio = scrollTop / (documentHeight - windowHeight);

      // Update sort based on scroll position
      if (ratio < 0.3) {
        setCurrentSort("time");
      } else if (ratio > 0.4) {
        setCurrentSort("fillRate");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!data) return;

    // Create scales and process data
    const newScales = createScales(data, currentSort);
    setScales(newScales);

    // Create gradient definition for time chart
    if (timeChartRef.current) {
      const svg = d3.select(timeChartRef.current);
      // Clear existing defs to prevent duplication
      svg.select("defs").remove();

      const defs = svg.append("defs");
      const gradient = defs
        .append("linearGradient")
        .attr("id", "time-chart-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("style", `stop-color: ${COLORS.background}; stop-opacity: 1`);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("style", `stop-color: ${COLORS.background}; stop-opacity: 0.8`);
    }

    // Create gradient definition for utilization chart
    if (utilizationChartRef.current) {
      const svg = d3.select(utilizationChartRef.current);
      // Clear existing defs to prevent duplication
      svg.select("defs").remove();

      const defs = svg.append("defs");
      const gradient = defs
        .append("linearGradient")
        .attr("id", "utilization-chart-gradient")
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "0%")
        .attr("y2", "100%");

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("style", `stop-color: ${COLORS.background}; stop-opacity: 1`);

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("style", `stop-color: ${COLORS.background}; stop-opacity: 0.8`);
    }
  }, [data, currentSort]);

  if (!scales) return null;

  return (
    <div className="stacked-bar-charts-container">
      {/* Time Chart Section */}
      <section className="chart-section time-chart-section">
        <div className="time-chart-container">
          <div className="stacked-bar-chart">
            <svg ref={timeChartRef} width="100%" height="100%">
              <TimeChart
                svgRef={timeChartRef}
                data={scales.sortedData}
                scales={scales}
                title="Distribution des passagers par bateau"
                subtitle="Nombre de passagers par catégorie"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Utilization Chart Section */}
      <section className="chart-section utilization-chart-section">
        <div className="utilization-chart-container">
          <div className="stacked-bar-chart">
            <svg ref={utilizationChartRef} width="100%" height="100%">
              <UtilizationChart
                svgRef={utilizationChartRef}
                data={scales.utilizationSortedData}
                scales={scales}
              />
            </svg>
          </div>
        </div>
      </section>
    </div>
  );
};

export default StackedBarChart;