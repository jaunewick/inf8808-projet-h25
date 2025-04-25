import React from "react";
import "./Boxplot.css";

function BoxplotSurvivalHeader() {
  return (
    <>
      <div className="container">
        <section className="story-section">
          <h2>
            Tarifs et embarquement : un regard croisé sur les inégalités à bord
          </h2>
          <p>
            Au-delà des différences de classe, le port d’embarquement jouait lui
            aussi un rôle dans la répartition des passagers à bord du Titanic.
            En croisant ces deux critères — classe et lieu d’embarquement — on
            peut mieux comprendre comment les conditions de départ reflétaient
            des réalités économiques distinctes, et comment elles ont pu
            influencer l’expérience des passagers, avant même que la tragédie ne
            survienne.
          </p>
        </section>
      </div>
      <div className="boxplot-container">
        <h3 className="boxplot-title">
          Étape 1: Distribution des prix des billets par survie
        </h3>
        <p className="chart-description">
          Cette première boîte à moustache présente la répartition des prix des
          billets en fonction de la survie des passagers. Les boîtes à
          moustaches illustrent les quartiles, la médiane, les limites et les
          valeurs aberrantes.
        </p>
      </div>
    </>
  );
}

export default BoxplotSurvivalHeader;
