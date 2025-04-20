import { useState, useEffect, useRef } from "react";
import * as d3 from "d3";
import scrollama from "scrollama";
import "./Waffle.css";

const COUNTRIES = {
  "Argentina": "Argentine", "Australia": "Australie", "Austria": "Autriche",
  "Belgium": "Belgique", "Canada": "Canada", "Channel Islands": "Îles Anglo-Normandes",
  "China/Hong Kong": "Hong Kong", "Croatia": "Croatie", "Croatia (Modern)": "Croatie (Moderne)",
  "Cuba": "Cuba", "Egypt": "Égypte", "England": "Angleterre",
  "Finland": "Finlande", "France": "France", "Germany": "Allemagne",
  "Greece": "Grèce", "Guyana": "Guyanne", "Hungary": "Hongrie",
  "India": "Inde", "Ireland": "Irelande", "Italy": "Italie",
  "Japan": "Japon", "Latvia": "Lettonie", "Lebanon": "Liban",
  "Mexico": "Mexique", "NA": "Origine inconnue", "Netherlands": "Pays-Bas",
  "Northern Ireland": "Irlande du Nord", "Peru": "Pérou", "Poland": "Pologne",
  "Russia": "Russie", "Scotland": "Écosse", "Siam": "Thaïlande",
  "Slovakia (Modern day)": "Slovaquie (actuelle)", "Slovenia": "Slovenie", "South Africa": "Affrique du Sud",
  "Spain": "Espagne", "Sweden": "Suède", "Switzerland": "Suisse",
  "Syria": "Syrie", "Turkey": "Turquie", "United States": "États-Unis",
  "Uruguay": "Uruguay", "Wales": "Pays de Galles", "Yugoslavia": "Yugoslavie",
  "Norway": "Norvège"
};

const REGIONS = {
  "Îles britanniques": ["England", "Channel Islands", "Wales", "Northern Ireland", "Ireland", "Scotland"],
  "Amérique": ["United States", "Argentina", "Canada", "Peru", "Cuba", "Guyana", "Uruguay", "Mexico"],
  "Scandinavie": ["Norway", "Sweden", "Finland", "Denmark"],
  "Asie": ["China/Hong Kong", "India", "Japan", "Lebanon", "Siam", "Syria", "Turkey", "Egypt"],
  "Europe de l'Ouest et Centrale": ["Belgium", "Austria", "France", "Germany", "Slovakia (Modern day)", "Slovenia", "Switzerland", "Poland", "Hungary", "Latvia", "Italy", "Spain", "Greece", "Russia", "Yugoslavia"],
  "Monde": Object.keys(COUNTRIES)
};

const REGION_COLORS = {
  "Îles britanniques": "#E63946",
  "Amérique": "#457B9D",
  "Scandinavie": "#1D3557",
  "Asie": "#F1C453",
  "Europe de l'Ouest et Centrale": "#2A9D8F"
};

const UNIT_SIDE_LENGTH = 7;
const UNIT_SPACING = 2;
const TRANSITION_DURATION = 1500;

export function Waffle({ data }) {
  const [passengers, setPassengers] = useState([]);
  const waffleRef = useRef(null);
  const svgRef = useRef(null);
  const stepRefs = useRef([]);
  const scroller = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const enhancedData = data.map((p, i) => ({ ...p, id: `passenger-${i}` }));
    setPassengers(enhancedData);
  }, []);

  useEffect(() => {
    if (!passengers.length || svgRef.current) return;

    const width = Math.min(window.innerWidth * 0.9, 1200);
    const height = 600;

    const svg = d3.select(waffleRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("class", "waffle-svg");

    svg.append("g").attr("class", "passengers-group");
    svgRef.current = svg.node();

    renderWaffle(0);
  }, [passengers]);

  useEffect(() => {
    if (!passengers.length) return;

    scroller.current = scrollama();
    scroller.current
      .setup({
        step: ".step-content",
        offset: 0.7,
        debug: false
      })
      .onStepEnter(({ index }) => {
        setCurrentStep(index);
        renderWaffle(index);
        console.log("Step entered:", index);
      });

    return () => {
      scroller.current?.destroy();
    };
  }, [passengers]);

  const renderWaffle = (step) => {
    if (!svgRef.current || !passengers.length) return;

    const svg = d3.select(svgRef.current);
    const width = parseInt(svg.attr("width")) - 100;
    const height = parseInt(svg.attr("height"));

    const getRegion = (country) => {
      for (const [region, countries] of Object.entries(REGIONS)) {
        if (region !== "Monde" && countries.includes(country)) return region;
      }
      return "Autre";
    };

    const regionMap = new Map();
    REGION_COLORS && Object.keys(REGION_COLORS).forEach(region => {
      const regionPassengers = passengers.filter(p => getRegion(p.country) === region);
      const sortedRegionPassengers = regionPassengers.sort((a, b) => {
        return a.survived === "yes" && b.survived !== "yes" ? -1 : 0;
      });
      regionMap.set(region, sortedRegionPassengers);
    });

    const sortedPassengers = [...passengers].sort((a, b) => {
      return a.survived === "yes" && b.survived !== "yes" ? -1 : 0;
    });
    

    const positions = sortedPassengers.map((d, i) => {
      if (step === 0) {
        const cols = Math.floor(width / (UNIT_SIDE_LENGTH + UNIT_SPACING));
        return {
          id: d.id,
          x: (i % cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          y: Math.floor(i / cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          fill: d.survived === "no" ? "#C2C9D1" : "#344C65"
        };
      } else {
        const region = getRegion(d.country);
        const regionPassengers = regionMap.get(region) || [];
        const regionIndex = Object.keys(REGION_COLORS).indexOf(region);
        const regionX = (regionIndex % 3) * (width / 3) + 20;
        const regionY = Math.floor(regionIndex / 3) * (height / 2) + 50;
        const regionIdx = regionPassengers.findIndex(p => p.id === d.id);
        const cols = Math.floor((width / 3 - 40) / (UNIT_SIDE_LENGTH + UNIT_SPACING));
        return {
          id: d.id,
          x: regionX + (regionIdx % cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          y: regionY + Math.floor(regionIdx / cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          fill: d.survived === "no"
            ? d3.color(REGION_COLORS[region] || "#777").darker(0.5).toString()
            : REGION_COLORS[region] || "#777"
        };
      }
    });

    const posMap = new Map(positions.map(p => [p.id, p]));

    const squares = svg.select(".passengers-group")
      .selectAll(".passenger-square")
      .data(sortedPassengers, d => d.id);

    squares.enter()
      .append("rect")
      .attr("class", "passenger-square")
      .attr("width", UNIT_SIDE_LENGTH)
      .attr("height", UNIT_SIDE_LENGTH)
      .attr("rx", 1)
      .attr("x", d => posMap.get(d.id).x)
      .attr("y", d => posMap.get(d.id).y)
      .attr("fill", d => posMap.get(d.id).fill)
      .style("opacity", 0)
      .on("mouseenter", (event, d) => {
        console.log(d["survived"]);
        const tooltip = d3.select(".waffle-chart")
          .append("div")
          .attr("class", "passenger-tooltip")
          .style("position", "absolute")
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY + 10}px`);
        for (const [key, value] of Object.entries(d)) {
          if (key !== "id") tooltip.append("div").text(`${key}: ${value}`);
        }
      })
      .on("mouseleave", () => {
        d3.selectAll(".passenger-tooltip").remove();
      })
      .transition()
      .duration(300)
      .style("opacity", 1);

    squares.transition()
      .duration(TRANSITION_DURATION)
      .attr("x", d => posMap.get(d.id).x)
      .attr("y", d => posMap.get(d.id).y)
      .attr("fill", d => posMap.get(d.id).fill);

    svg.selectAll(".region-label").remove();

    if (step === 1) {
      Object.keys(REGION_COLORS).forEach((region, i) => {
        const regionX = (i % 3) * (width / 3) + (width / 6);
        const regionY = Math.floor(i / 3) * (height / 2) + 30;
        svg.append("text")
          .attr("class", "region-label")
          .attr("x", regionX)
          .attr("y", regionY - 10)
          .attr("text-anchor", "middle")
          .attr("font-weight", "bold")
          .attr("font-size", "16px")
          .text(region);
      });
    }
  };

  return (
    <div className="waffle-chart scrollytelling" ref={waffleRef}>
        {/* Introduction Section */}
        <section className="story-section">
          <h2>Qui étaient à bord du Titanic ?</h2>
          <p>
          Le Titanic transportait des passagers venus d’Europe, d’Amérique, d’Asie et d’autres régions du monde.
          Cette diversité d’origines montre à quel point le voyage dépassait les frontières nationales.
          Des personnes de différents pays se retrouvaient à bord, réunies pour traverser l’Atlantique.
          </p>
        </section>
      <div className="scroller">
        {[0, 1].map((_, i) => (
          <div className="step-content" key={i} ref={el => stepRefs.current[i] = el}>
            {i === 0 && (
              <>
              <h3>
                {currentStep === 0 ? "Répartition mondiale" : "Répartition par région d'origine"}
              </h3>
              <p>
                  Chaque carré représente un passager. Les couleurs des carrés indiquent la région d'origine du passager.
                </p>
              </>
            ) }
            {i === 0 && (
              <div className="waffle-labels">
              <div className="survived-label square"></div>
              <span>Survivant</span>
              <div className="deceased-label square"></div>
              <span>Naufragé</span>
            </div>
            )}
            <div style={{height: "100px", display: "none"}} />
          </div>
        ))}
      </div>
      <div className="footer-spacer" />
    </div>
  );
}

export default Waffle;
