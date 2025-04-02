import * as d3 from "d3";

export const createScales = (data, sortBy) => {
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
      return b.utilization - a.utilization;
    }
  });

  // Create a separate sort for the utilization chart
  const utilizationSortedData = [...processedData].sort((a, b) => {
    if (sortBy === "time") {
      return a.time - b.time;
    } else {
      return b.utilization - a.utilization;
    }
  });

  // Define the keys for stacking
  const keys = ["crew", "men", "women", "overload", "remaining"];

  // Set up the dimensions
  const margin = { top: 120, right: 10, bottom: 80, left: 180 };
  const width = 1000 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

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
    .domain(utilizationSortedData.map((d) => d.boat))
    .range([0, width])
    .padding(0.1);

  const y2 = d3.scaleLinear().domain([0, 110]).range([height, 0]);

  // Create color scale
  const color = d3
    .scaleOrdinal()
    .domain(keys)
    .range(["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#f2f2f2"]);

  return {
    margin,
    width,
    height,
    xTime,
    y,
    x,
    y2,
    color,
    keys,
    sortedData,
    utilizationSortedData,
  };
};
