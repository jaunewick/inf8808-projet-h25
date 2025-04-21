import React from 'react'
import './Boxplot.css';

function BoxplotPortClassSurvivalHeader() {
	return (
		<div className="boxplot-container">
			<h3 className="boxplot-title">Étape 3 : Distribution des prix des billets par classe et port d'embarquement</h3>
			<p className="chart-description">
				Et enfin, cette dernière boîte à moustache présente la répartition des prix des billets en fonction de la classe et du port d'embarquement.
				En distinguant les passagers par classe et port, elle met en évidence les écarts des prix des billets et de survie entre les classes et les ports d'embarquement.
			</p>
		</div>
	)
}

export default BoxplotPortClassSurvivalHeader