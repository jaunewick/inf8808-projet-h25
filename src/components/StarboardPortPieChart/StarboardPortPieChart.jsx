import { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
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

export const StarboardPortPieChart = ({ data }) => {
  const scrollerRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(null);
  const [visibleCharts, setVisibleCharts] = useState(false);
  
  const [charts, setCharts] = useState(
    CHART_CONFIGS.map((c) => ({ ...c, data: [] }))
  );

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

    useEffect(() => {
      const scroller = scrollama();
      scroller
        .setup({
          step: ".step",
          offset: 0.6,
          progress: false,
        })
        .onStepEnter(response => {
          const step = response.element.getAttribute("data-step");
          setCurrentStep(step);

          if (charts.length > 0) {
            const timeouts = charts.map((_, index) =>
              setTimeout(() => setVisibleCharts((prev) => prev + 1), index * 250)
            );
            return () => timeouts.forEach(clearTimeout);
          }
        })
        .onStepExit(() => {
          setCurrentStep(null);
        });
  
      return () => scroller.destroy();
    }, [charts]);

  return (
    <div className="container scrollytelling" ref={scrollerRef}>
    {/* Introduction Section */}
    <section className="story-section">
      <h2>Tribord ou bâbord: un côté plus sûr que l’autre?</h2>
      <p>
        Dans la panique du naufrage, chaque minute comptait… et chaque côté du navire aussi. Cette visualisation
        explore la répartition des passagers dans les canots de sauvetage selon qu’ils aient embarqué du côté tribord ou bâbord.
      </p>
    </section>
      <div className={`${classes.section} step ${currentStep === "charts" ? "is-active" : ""}`} data-step="charts" >
        <div className={classes.left}>
          <div className={classes.container}>
            {charts.map(({ key, title, data }, index) => (
              <div 
                key={key} 
                className={`${classes.chart} ${
                  index < visibleCharts ? classes.visible : ""
                }`}
              >
              <PieChart
                key={key}
                title={title}
                data={data}
                colors={COLORS}
                width={WIDTH}
                height={HEIGHT}
              />
              </div>
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
      <div className="chart-analysis">
        <p>
          Les différences sont frappantes : alors que les femmes sont réparties de façon quasi équilibrée, les hommes
          ont été massivement dirigés vers bâbord, tout comme une majorité de membres de l’équipage. Cette asymétrie soulève
          une question: était-ce une simple conséquence du positionnement des canots? Ou le fruit de décisions humaines, conscientes
          ou non, prises dans l’urgence? Une chose est sûre : même l’orientation sur le navire pouvait influencer le destin.
        </p>
      </div>
    </div>
  );
};
