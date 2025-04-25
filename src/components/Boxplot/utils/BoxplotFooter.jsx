import React from "react";
import "./Boxplot.css";

function BoxplotFooter() {
  return (
    <div className="boxplot-footer boxplot-container">
      <div className="chart-analysis">
        <p>Synthèse des tendances :</p>
        <ul>
          <li>
            <strong>Vue globale</strong> : Les survivants avaient généralement
            des billets plus coûteux que les naufragés.
          </li>
          <li>
            <strong>Par classe</strong> : La survie augmente avec le niveau de
            la classe, la troisième classe étant clairement désavantagée.
          </li>
          <li>
            <strong>Par port et classe</strong> : Cherbourg et Southampton
            montrent une survie élevée en première classe. Cependant, les
            passagers embarqués à Southampton ont subi des pertes
            disproportionnées.
          </li>
        </ul>
      </div>
    </div>
  );
}

export default BoxplotFooter;
