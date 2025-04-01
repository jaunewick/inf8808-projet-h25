import { useEffect, useState } from "react";
import DBReader from "../../services/dbReader";
import { PieChart } from "./PieChart";
import classes from "./StarboardPortPieChart.module.css";

const WIDTH = 225;
const HEIGHT = 225;
const COLORS = ["#344C65", "#E9BA24"];

/**
 * @param {any[]} data
 * @param {"men" | "women" | "crew" | "total"} key
 * @returns {{ label: string, value: number }[]}
 */
const aggregateBySide = (data, key) => {
  const sumBySide = (side) =>
    data
      .filter((item) => item.side === side)
      .reduce((sum, item) => sum + parseInt(item[key]), 0);

  return [
    { label: "Tribord", value: sumBySide("Starboard") },
    { label: "Bâbord", value: sumBySide("Port") },
  ];
};

export const StarboardPortPieChart = () => {
  const [data, setData] = useState([]);

  const [charts, setCharts] = useState([
    {
      key: "men",
      title: "Hommes par emplacement des canôts de sauvetages",
      data: [],
    },
    {
      key: "women",
      title: "Femmes par emplacement des canôts de sauvetages",
      data: [],
    },
    {
      key: "crew",
      title: "Membre de l'équipage par emplacement des canôts de sauvetages",
      data: [],
    },
    {
      key: "total",
      title: "Total par emplacement des canôts de sauvetages",
      data: [],
    },
  ]);

  useEffect(() => {
    DBReader.getLifeboatsData()
      .then(setData)
      .catch((error) => {
        setData([]);
        console.error("Error fetching lifeboats data:", error);
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setCharts((prevCharts) =>
        prevCharts.map((chart) => ({
          ...chart,
          data: aggregateBySide(data, chart.key),
        }))
      );
    }
  }, [data]);

  return (
    <div className={classes.section}>
      <div className={classes.left}>
        <h2>
          Répartition des passagers dans les canots de sauvetages selon la zone
          du bateau
        </h2>
        <div className={classes.container}>
          {charts.map(({ key, title, data }) => (
            <PieChart
              key={key}
              data={data}
              title={title}
              colors={COLORS}
              width={WIDTH}
              height={HEIGHT}
            />
          ))}
        </div>
      </div>
      <div className={classes.right}>
        <div className={classes.legend}>
          <div className={classes.legendItem}>
            <div className={classes.colorBox} />
            <span>Tribord</span>
          </div>
          <div className={classes.legendItem}>
            <div className={classes.colorBox} />
            <span>Bâbord</span>
          </div>
        </div>
      </div>
    </div>
  );
};
