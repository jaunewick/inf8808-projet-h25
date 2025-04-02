import { useEffect, useState } from "react";
import DBReader from "../../services/dbReader";
import { PieChart } from "./PieChart";
import classes from "./StarboardPortPieChart.module.css";

const WIDTH = 225;
const HEIGHT = 225;
const COLORS = ["#344C65", "#E9BA24"];

const SIDES = [
  { side: "Starboard", label: "Tribord", color: COLORS[0] },
  { side: "Port", label: "Bâbord", color: COLORS[1] },
];

/**
 * @param {any[]} data
 * @param {"men" | "women" | "crew" | "total"} key
 * @returns {{ label: string, value: number }[]}
 */
const aggregateBySide = (data, key) =>
  SIDES.map(({ side, label }) => ({
    label,
    value: data
      .filter((item) => item.side === side)
      .reduce((sum, item) => sum + parseInt(item[key]), 0),
  }));

const CHART_CONFIGS = [
  { key: "men", title: "Répartition des hommes" },
  { key: "women", title: "Répartition des femmes" },
  { key: "crew", title: "Répartition des membres de l'équipage" },
  { key: "total", title: "Répartition globale" },
];

export const StarboardPortPieChart = () => {
  const [data, setData] = useState([]);
  const [charts, setCharts] = useState(
    CHART_CONFIGS.map((c) => ({ ...c, data: [] }))
  );

  useEffect(() => {
    DBReader.getLifeboatsData()
      .then(setData)
      .catch((error) => {
        console.error("Error fetching lifeboats data:", error);
        setData([]);
      });
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      setCharts((prev) =>
        prev.map((chart) => ({
          ...chart,
          data: aggregateBySide(data, chart.key),
        }))
      );
    }
  }, [data]);

  return (
    <>
      <h2>
        Répartition des passagers dans les canots de sauvetages selon la zone du
        bateau
      </h2>
      <div className={classes.section}>
        <div className={classes.left}>
          <div className={classes.container}>
            {charts.map(({ key, title, data }) => (
              <PieChart
                key={key}
                title={title}
                data={data}
                colors={COLORS}
                width={WIDTH}
                height={HEIGHT}
              />
            ))}
          </div>
        </div>
        <div className={classes.right}>
          <div className={classes.legend}>
            {SIDES.map(({ label, color }) => (
              <div key={label} className={classes.legendItem}>
                <div
                  className={classes.colorBox}
                  style={{ backgroundColor: color }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
