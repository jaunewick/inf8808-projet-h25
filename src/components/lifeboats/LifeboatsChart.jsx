import React, { useEffect, useState } from "react";
import StackedBarChart from "../stacked-bar-chart/StackedBarChart";
import dbReader from "../../services/dbReader";

const LifeboatsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const lifeboatsData = await dbReader.getLifeboatsData();
        setData(lifeboatsData);
        console.log("lifeboatsData", lifeboatsData);
      } catch (err) {
        setError("Error loading lifeboats data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading lifeboats data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="lifeboats-chart-container">
      <StackedBarChart data={data} />
    </div>
  );
};

export default LifeboatsChart;
