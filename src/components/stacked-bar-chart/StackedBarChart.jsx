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
    {/* Introduction Section */}
    <section className="story-section">
      <h2>Le Naufrage du Titanic : Une Analyse des Canots de Sauvetage</h2>
      <p>
        Dans la nuit du 14 au 15 avril 1912, le RMS Titanic, réputé insubmersible, 
        heurta un iceberg et sombra dans les eaux glacées de l'Atlantique Nord. 
        Cette tragédie a révélé de nombreuses leçons sur la sécurité maritime et 
        la gestion des situations d'urgence. Notre analyse se concentre sur 
        l'utilisation des canots de sauvetage, un aspect crucial de cette catastrophe.
      </p>
    </section>

    {/* Time Chart Section */}
    <section className="chart-section">
      <h3>Distribution Temporelle des Départs des Canots</h3>
      <p className="chart-description">
        Ce graphique montre la chronologie des départs des canots de sauvetage, 
        révélant comment l'évacuation s'est déroulée dans le temps. On observe 
        une progression de l'évacuation, avec des pics d'activité à certains moments, 
        reflétant l'urgence croissante de la situation.
      </p>
      <div className="time-chart-container">
        <div className="stacked-bar-chart maritime-bulletin">
          <svg ref={timeChartRef} width="100%" height="100%">
            <TimeChart
              svgRef={timeChartRef}
              data={scales.sortedData}
              scales={scales}
            />
          </svg>
        </div>
      </div>
      <div className="chart-analysis">
        <p>
          L'analyse de la distribution temporelle révèle plusieurs points importants :
        </p>
        <ul>
          <li>Les premiers canots ont été mis à l'eau avec une capacité sous-utilisée</li>
          <li>La rapidité de l'évacuation a augmenté avec le temps</li>
          <li>Certains canots ont été lancés très tard, alors que le navire commençait à sombrer</li>
        </ul>
      </div>
    </section>

    {/* Transition Text */}
    <section className="story-section">
      <h3>De la Chronologie à l'Efficacité</h3>
      <p>
        Alors que le temps était un facteur crucial, l'efficacité de l'utilisation 
        des canots a joué un rôle tout aussi important dans le sauvetage des passagers. 
        Le graphique suivant examine le taux de remplissage de chaque canot, nous 
        permettant d'évaluer l'efficacité de l'évacuation.
      </p>
    </section>

    {/* Utilization Chart Section */}
    <section className="chart-section">
      <h3>Taux de Remplissage des Canots</h3>
      <p className="chart-description">
        Cette visualisation présente le taux de remplissage de chaque canot de 
        sauvetage, comparant le nombre réel de passagers à la capacité maximale. 
        Les différences de couleur indiquent les niveaux de surcharge ou de 
        sous-utilisation.
      </p>
      <div className="utilization-chart-container">
        <div className="stacked-bar-chart maritime-bulletin">
          <svg ref={utilizationChartRef} width="100%" height="100%">
            <UtilizationChart
              svgRef={utilizationChartRef}
              data={scales.utilizationSortedData}
              scales={scales}
            />
          </svg>
    </div>
      </div>
      <div className="chart-analysis">
        <p>
          L'analyse du taux de remplissage révèle des informations cruciales :
        </p>
        <ul>
          <li>Plusieurs canots sont partis à moitié vides</li>
          <li>Certains canots ont été surchargés au-delà de leur capacité</li>
          <li>La distribution n'était pas uniforme entre les différents canots</li>
        </ul>
      </div>
    </section>

    {/* Conclusion Section */}
    <section className="story-section">
      <h3>Leçons et Héritage</h3>
      <p>
        L'analyse des données de l'évacuation du Titanic révèle des leçons 
        importantes sur la gestion des situations d'urgence en mer. La 
        sous-utilisation des premiers canots et la surcharge de certains 
        autres ont contribué à la perte de vies humaines. Ces enseignements 
        ont directement influencé les réglementations maritimes modernes, 
        notamment en ce qui concerne :
      </p>
      <ul>
        <li>Le nombre minimum de canots de sauvetage requis</li>
        <li>Les procédures d'évacuation et d'embarquement</li>
        <li>La formation du personnel en situation d'urgence</li>
        <li>Les normes de capacité et de sécurité des canots</li>
      </ul>
      <p>
        Cette tragédie a servi de catalyseur pour améliorer la sécurité 
        maritime et continue d'influencer les normes de sécurité actuelles.
      </p>
    </section>
  </div>
  );
};

export default StackedBarChart;
