import * as d3 from "d3";
import React, { useEffect, useState } from "react";

import { standingPerson } from "../../assets/standingPerson";
import SurvivalCalculator from "../../services/probabilityCalculator";
import "./Pictograph.css";

const PictographFilters = () => {
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");

  const createVisualization = (text, value) => {
    const svgDoc = d3
      .select("#visualization-container")
      .append("svg")
      .attr("width", 600)
      .attr("height", 130);

    svgDoc
      .append("defs")
      .append("g")
      .attr("id", `iconCustom${text}`)
      .append("path")
      .attr("d", standingPerson);

    const numCols = 10;
    const numRows = 1;
    const xPadding = 0;
    const yPadding = 5;
    const hBuffer = 0;
    const wBuffer = 55;
    const myIndex = d3.range(numCols * numRows);

    svgDoc
      .append("g")
      .attr("id", `pictoLayer${text}`)
      .selectAll("use")
      .data(myIndex)
      .enter()
      .append("use")
      .attr("xlink:href", `#iconCustom${text}`)
      .attr("id", (d) => `icon${text}${d}`)
      .attr("x", (d) => {
        const remainder = d % numCols;
        return xPadding + remainder * wBuffer;
      })
      .attr("y", (d) => {
        const whole = Math.floor(d / numCols);
        return yPadding + whole * hBuffer;
      })
      .attr("class", (d) =>
        d < Math.round(value) ? "iconSelected" : "iconPlain",
      );
  };

  const updateVisualization = React.useCallback(async () => {
    d3.select("#visualization-container").html("");
    const result = await SurvivalCalculator.getSurvivalProbability({
      isMale: genderFilter === "all" ? null : genderFilter === "male",
      passengerClass: classFilter === "all" ? null : parseInt(classFilter),
      ageRange:
        ageFilter === "all"
          ? null
          : ageFilter === "child"
            ? [0, 17]
            : ageFilter === "youngadult"
              ? [18, 24]
              : ageFilter === "adult"
                ? [25, 64]
                : ageFilter === "elderly"
                  ? [65, 100]
                  : null,
    });

    createVisualization("user", result || 0);
  }, [genderFilter, ageFilter, classFilter]);

  useEffect(() => {
    updateVisualization();
  }, [genderFilter, ageFilter, classFilter, updateVisualization]);

  return (
    <div>
      <div className="filters">
        <div className="filter-group">
          <div className="filter-label">Genre</div>
          <select
            id="gender-filter"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Âge</div>
          <select
            id="age-filter"
            value={ageFilter}
            onChange={(e) => setAgeFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="child">0-17 ans</option>
            <option value="youngadult">18-24 ans</option>
            <option value="adult">25-64</option>
            <option value="elderly">65+</option>
          </select>
        </div>

        <div className="filter-group">
          <div className="filter-label">Classe</div>
          <select
            id="class-filter"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="1">1ère classe</option>
            <option value="2">2ème classe</option>
            <option value="3">3ème classe</option>
          </select>
        </div>
      </div>

      <div id="visualization-container"></div>
    </div>
  );
};

export default PictographFilters;
