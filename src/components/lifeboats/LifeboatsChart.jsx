import React, { useEffect } from "react";
import StackedBarChart from "../stacked-bar-chart/StackedBarChart";

const LifeboatsChart = ({ data }) => {

  useEffect(() => {
    if (!data) return;
  }, [data]);

  return (
    <div className="lifeboats-chart-container">
      <StackedBarChart data={data} />
    </div>
  );
};

export default LifeboatsChart;
