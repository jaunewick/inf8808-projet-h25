import React from 'react'
import './Boxplot.css';

function BoxplotSurvivalHeader() {
    return (
        <div className="boxplot-container">
            <p className="chart-analysis">
                Les boîtes à moustaches ci-dessous sont interactives: survolez les éléments pour afficher des informations supplémentaires.
            </p>
            <h3 className="boxplot-title">Étape 1: Distribution des prix des billets par survie</h3>
            <p className="chart-description">
                Cette première boîte à moustache présente la répartition des prix des billets en fonction de la survie des passagers.
                Les boîtes à moustaches illustrent les quartiles, la médiane, les limites et les valeurs aberrantes.
            </p>
        </div>
    )
}

export default BoxplotSurvivalHeader