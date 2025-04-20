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
  "Europe de l'Ouest et Centrale": "#2A9D8F",
  "Autre": "#777777"
};

const REGION_POSITIONS = {
  "Îles britanniques": { column: 0, row: 0 },
  "Amérique": { column: 1, row: 0 },
  "Scandinavie": { column: 2, row: 0 },
  "Asie": { column: 2, row: 1 },
  "Europe de l'Ouest et Centrale": { column: 1, row: 1 },
  "Autre": { column: 1, row: 2 } 
};

const PORTS = {
  S: "Southampton",
  C: "Cherbourg",
  Q: "Queenstown"
};

const CLASS_LABELS = {
  "1st": "Première classe",
  "2nd": "Deuxième classe",
  "3rd": "Troisième classe",
  "crew": "Équipage",
  "unknown": "Inconnu"
};

const UNIT_SIDE_LENGTH = 7;
const UNIT_SPACING = 4;
const TRANSITION_DURATION = 1500;

export function Waffle({ data }) {
  const [passengers, setPassengers] = useState([]);
  const waffleRef = useRef(null);
  const svgRef = useRef(null);
  const scroller = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const enhancedData = data.map((p, i) => ({ ...p, id: `passenger-${i}`, class: p.class.includes("crew") ? "crew" : p.class}));
    setPassengers(enhancedData);
  }, [data]);

  useEffect(() => {
    const handleScroll = () => {
      d3.selectAll(".passenger-tooltip").remove();
    };
  
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);
  
  useEffect(() => {
    if (!passengers.length) return;

    // Create SVG only once
    if (!svgRef.current) {
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
    }

    // Setup scrollama
    scroller.current = scrollama();
    scroller.current
      .setup({
        step: ".step-waffle",
        offset: 0.5,
        debug: false
      })
      .onStepEnter(({ index }) => {
        setCurrentStep(index);
        renderWaffle(index);
      });

    return () => {
      scroller.current?.destroy();
    };
  }, [passengers]);

  // Tooltip function
  const showTooltip = (event, passenger) => {
    d3.select(".waffle-chart").selectAll(".passenger-tooltip").remove();
  
    const container = d3.select(".waffle-chart").node().getBoundingClientRect();
  
    const tooltip = d3.select(".waffle-chart")
      .append("div")
      .attr("class", "passenger-tooltip")
      .style("position", "absolute")
      .style("left", `${event.clientX - container.left + 10}px`)
      .style("top", `${event.clientY - container.top + 10}px`);
  
    tooltip.append("div").text(`Nom: ${passenger.name || "Inconnu"}`);
    tooltip.append("div").text(`Pays: ${COUNTRIES[passenger.country] || "Inconnu"}`);
    tooltip.append("div").text(`Classe: ${CLASS_LABELS[passenger.class] || "Inconnue"}`);
    tooltip.append("div").text(`Âge: ${passenger.age ? `${parseFloat(passenger.age).toFixed(0)} ans` : "?"}`);
    tooltip.append("div").text(`Genre: ${passenger.sex === "male" ? "Homme" : "Femme"}`);
    tooltip.append("div").text(`Survie: ${passenger.survived === "yes" ? "Oui" : "Non"}`);
    passenger.ticketno != "NA" && tooltip.append("div").text(`# de ticket: ${passenger.ticketno || "?"}`);
    passenger.fare != "NA" && tooltip.append("div").text(`$ du billet: ${passenger.fare ? `${parseFloat(passenger.fare).toFixed(2)} $` : "?"}`);
    passenger.embarked != "?" && tooltip.append("div").text(`Port d'embarquement: ${PORTS[passenger.embarked] || "?"}`);
  };
  

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
    Object.keys(REGION_POSITIONS).forEach(region => {
      const regionPassengers = passengers.filter(p => getRegion(p.country) === region);
      const sortedRegionPassengers = regionPassengers.sort((a, b) => {
        return (b.survived === "yes") - (a.survived === "yes");
      });
      regionMap.set(region, sortedRegionPassengers);
    });

    const sortedPassengers = [...passengers].sort((a, b) => {
      return (b.survived === "yes") - (a.survived === "yes");
    });
    
    const positions = sortedPassengers.map((d, i) => {
      if (step === 0) {
        const cols = Math.floor(width / (UNIT_SIDE_LENGTH + UNIT_SPACING));
        return {
          id: d.id,
          x: (i % cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          y: Math.floor(i / cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          fill: d.survived === "yes" ? "#344C65" : "transparent",
          stroke: d.survived === "no" ? "#344C65" : "none",
          strokeWidth: d.survived === "no" ? 1.2 : 0
        };
        
      } else {
        const region = getRegion(d.country);
        const regionPassengers = regionMap.get(region) || [];
        
        const position = REGION_POSITIONS[region] || REGION_POSITIONS["Autre"];
        
        // Calculer les coordonnées en fonction de la colonne et de la ligne
        const regionX = position.column * (width / 3) + 20;
        const regionY = position.row * (height / 3) + 30;
        
        const regionIdx = regionPassengers.findIndex(p => p.id === d.id);
        const cols = Math.floor((width / 3 - 40) / (UNIT_SIDE_LENGTH + UNIT_SPACING));
        return {
          id: d.id,
          x: regionX + (regionIdx % cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          y: regionY + Math.floor(regionIdx / cols) * (UNIT_SIDE_LENGTH + UNIT_SPACING),
          fill: d.survived === "yes"
            ? REGION_COLORS[region] || REGION_COLORS["Autre"]
            : "transparent",
          stroke: d.survived === "no"
            ? d3.color(REGION_COLORS[region] || REGION_COLORS["Autre"]).darker(0.2).toString()
            : "none",
          strokeWidth: d.survived === "no" ? 1.2 : 0
        };
        
      }
    });

    const posMap = new Map(positions.map(p => [p.id, p]));

    const squares = svg.select(".passengers-group")
      .selectAll(".passenger-square")
      .data(sortedPassengers, d => d.id);

    // Enter new squares
    squares.enter()
      .append("rect")
      .attr("class", "passenger-square")
      .attr("width", UNIT_SIDE_LENGTH)
      .attr("height", UNIT_SIDE_LENGTH)
      .attr("rx", 1)
      .attr("x", d => posMap.get(d.id).x)
      .attr("y", d => posMap.get(d.id).y)
      .attr("fill", d => posMap.get(d.id).fill)
      .attr("stroke", d => posMap.get(d.id).stroke)
      .attr("stroke-width", d => posMap.get(d.id).strokeWidth)
      .style("opacity", 0)
      .on("mouseenter", (event, d) => {
        showTooltip(event, d);
      })
      .on("mouseleave", () => {
        d3.selectAll(".passenger-tooltip").remove();
      })
      .transition()
      .duration(300)
      .style("opacity", 1);

    // Update existing squares
    squares.transition()
      .duration(TRANSITION_DURATION)
      .attr("x", d => posMap.get(d.id).x)
      .attr("y", d => posMap.get(d.id).y)
      .attr("fill", d => posMap.get(d.id).fill)
      .attr("stroke", d => posMap.get(d.id).stroke)
      .attr("stroke-width", d => posMap.get(d.id).strokeWidth)
      
      squares
      .on("mouseenter", (event, d) => {
        showTooltip(event, d);
      })
      .on("mouseleave", () => {
        d3.selectAll(".passenger-tooltip").remove();
      });
    

    svg.selectAll(".region-label").remove();

    if (step === 1) {
      Object.entries(REGION_POSITIONS).forEach(([region, position]) => {
        const regionX = position.column * (width / 3) + (width / 6);
        const regionY = position.row * (height / 3) + 30;
        
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
    <div className="waffle-chart">
      {/* Introduction Section */}
      <section className="story-section">
        <h2>Qui étaient à bord du Titanic ?</h2>
        <p>
        Le Titanic transportait des passagers venus d'Europe, d'Amérique, d'Asie et d'autres régions du monde.
        Cette diversité d'origines montre à quel point le voyage dépassait les frontières nationales.
        Des personnes de différents pays se retrouvaient à bord, réunies pour traverser l'Atlantique.
        </p>
      </section>
      
      <div className="chart-container" ref={waffleRef}>
        <div className="chart-header">
          <h3>{currentStep === 0 ? "Répartition mondiale" : "Répartition par région d'origine"}</h3>
          <div className="waffle-labels">
            <div className="survived-label square"></div>
            <span>Survivant</span>
            <div className="deceased-label square"></div>
            <span>Naufragé</span>
          </div>
        </div>
      </div>
      
      <div className="steps-container">
        <div className="step-waffle step-0" data-scrollama-index="0">
          <div className="step-content">
          </div>
        </div>
        
        <div className="step-waffle step-1" data-scrollama-index="1">
          <div className="step-content">
          </div>
        </div>
      </div>
    </div>
  );
}

export default Waffle;