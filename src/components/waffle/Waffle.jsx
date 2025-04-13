import { useState, useEffect } from "react";
import * as d3 from "d3";

import DBReader from "../../services/dbReader";

import "./Waffle.css";

const COUNTRIES = {
  "Argentina": "Argentine", "Australia": "Australie", "Austria": "Autriche",
  "Belgium": "Belgique", "Canada": "Canada", "Channel Islands": "Îles Anglo-Normandes",
  "China/Hong Kong": "Hong Kong", "Croatia": "Croatie", "Croatia (Modern)": "Croatie (Moderne)",
  "Cuba": "Cuba", "Egypt": "Égypte", "England": "Angleterre",
  "Finland": "Finlande", "France": "France", "Germany": "Allemagne",
  "Greece": "Grèce", "Guyana": "Guyanne",  "Hungary": "Hongrie",
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
}

const REGIONS = {
  "Îles britanniques": ["England", "Channel Islands", "Wales", "Northern Ireland", "Ireland", "Scotland"],
  "Amérique": ["United States", "Argentina", "Canada", "Peru", "Cuba", "Guyana", "Uruguay"],
  "Scandinavie": ["Norway", "Sweden", "Finland", "Denmark"],
  "Asie": ["China/Hong Kong", "India", "Japan", "Lebanon", "Siam", "Syria", "Turkey"],
  "Europe de l'Ouest et Centrale": ["Belgium", "Austria", "France", "Germany", "Slovakia (Modern day)", "Slovenia", "Switzerland", "Poland", "Hungary", "Latvia"],
  "Monde": Object.keys(COUNTRIES)
}

const UNIT_SIDE_LENGTH = 7;
const UNIT_SPACING = 2;
const NUMBER_UNITS_PER_ROW = 20;
const MAX_WIDTH = (UNIT_SIDE_LENGTH + UNIT_SPACING) * NUMBER_UNITS_PER_ROW;

export default function Waffle() {
  const [countriesToRender, setCountriesToRender] = useState(REGIONS["Monde"]);
  const [survivorsPerCountry, setSurvivorsPerCountry] = useState(undefined);
  const [selectedRegion, setSelectedRegion] = useState("Monde");

  useEffect(() => {
    DBReader.getTitanicData().then((passengerData) => {
      const survivors = {};

      for (const passenger of passengerData) {
        if (survivors[passenger.country] === undefined) {
          survivors[passenger.country] = [passenger];
        } else {
          survivors[passenger.country].push(passenger);
        }
      }

      for (const country in survivors) {
        survivors[country].sort((a, b) => d3.ascending(a.survived, b.survived));
      }

      setSurvivorsPerCountry(survivors);
    })
  }, []);

  useEffect(() => {
    d3.selectAll(".waffle-bars div").remove();

    if (survivorsPerCountry === undefined || countriesToRender === undefined)
      return;

    countriesToRender.sort((a, b) => {
      return d3.descending(survivorsPerCountry[a].length, survivorsPerCountry[b].length);
    })

    for (const country of countriesToRender) {
      const passagers = survivorsPerCountry[country];

      const countryBar = d3.select(".waffle-bars").append("div").attr("class", "waffle-bar");
      countryBar
        .append("div")
        .text(COUNTRIES[country] ? COUNTRIES[country] : country);
      
      const svg = countryBar
        .append("svg")
        .attr("width", Math.min(passagers.length * (UNIT_SIDE_LENGTH + UNIT_SPACING), MAX_WIDTH))
        .attr("height", passagers.length / 20 * (UNIT_SIDE_LENGTH + UNIT_SPACING));

      const g = svg.append("g");

      g.selectAll(".square")
        .data(passagers)
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("x", (_, i) => (i % NUMBER_UNITS_PER_ROW) * (UNIT_SIDE_LENGTH + UNIT_SPACING))
        .attr("y", (_, i) => Math.floor(i / NUMBER_UNITS_PER_ROW) * (UNIT_SIDE_LENGTH + UNIT_SPACING))
        .attr("fill", (d) => d.survived === "no" ? "#C2C9D1" : "#344C65")
        .exit();
    }
  }, [countriesToRender, survivorsPerCountry])

  useEffect(() => {
    setCountriesToRender(REGIONS[selectedRegion]);
  }, [selectedRegion])

  return (
    <>
      <div className="waffle-selection">
        <label>
          Région géographique:
          <select value={selectedRegion} onChange={e => setSelectedRegion(e.target.value)}>
            <option value="Monde">Monde</option>
            <option value="Îles britanniques">Îles britanniques</option>
            <option value="Amérique">Amérique</option>
            <option value="Scandinavie">Scandinavie</option>
            <option value="Asie">Asie</option>
            <option value="Europe de l'Ouest et Centrale">Europe de l'Ouest et Centrale</option>
          </select>
        </label>
        <label>

        </label>
      </div>
      <div className="waffle-labels">
          <div className="survived-label square" background-color="#344C65"></div>
          <span>Survivant</span>
          <div className="deceased-label square" background-color="#C2C9D1"></div>
          <span>Naufragé</span>
      </div>
      <div className="waffle-bars"></div>
      <div className="waffle-hover"></div>
    </>
  );
}
