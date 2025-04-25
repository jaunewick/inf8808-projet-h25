import React from "react";

import "./BoxplotHeaders.css";

const BoxplotClassSurvivalHeader = () => {
  return (
    <div className="boxplot-container">
      <h3 className="boxplot-title">
        Étape 2: Distribution des prix des billets par classe et survie
      </h3>
      <p className="chart-description">
        Cette deuxième boîte à moustache présente la répartition des prix des
        billets en fonction de la classe et de la survie. En distinguant les
        passagers par classe, elle met en évidence les écarts des prix des
        billets et de survie entre les classes.
      </p>
    </div>
  );
};

export default BoxplotClassSurvivalHeader;
