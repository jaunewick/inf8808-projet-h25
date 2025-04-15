import SankeyDiagram from "./components/sankey/sankey";
import { useState, useEffect } from 'react'
import DBReader from './services/dbReader'
import { StarboardPortPieChart } from "./components/StarboardPortPieChart/StarboardPortPieChart";
import Waffle from './components/waffle/Waffle';

import LifeboatsChart from "./components/lifeboats/LifeboatsChart";
import StackedBarChart from "./components/stacked-bar-chart/StackedBarChart";
import TimeChart from "./components/stacked-bar-chart/components/TimeChart";
import UtilizationChart from "./components/stacked-bar-chart/components/UtilizationChart";
import Boxplot from "./components/boxplot/Boxplot";
import PictographChart from "./components/pictograph/PictographFilters";
import PictographSection from "./components/pictograph/PictographSection";

function App() {
  const [titanicData, setData] = useState(null);
  const [lifeboatsData, setLifeboatsData] = useState(null);

  async function fetchData() {
    const titanicData = await DBReader.getTitanicData();
    const lifeboatsData = await DBReader.getLifeboatsData();

    setData(titanicData);
    setLifeboatsData(lifeboatsData);
  }

  useEffect(() => {
    fetchData();
  }, [titanicData, lifeboatsData]);

  return (
    <div className="vintage-newspaper">
      <header className="newspaper-header">
        <h1 className="newspaper-title">Le Journal Transatlantique</h1>
        <p className="newspaper-subtitle">
          15 avril 1912 • Vol. LXII • N° 108 • Prix : 1¢
        </p>
      </header>

      <h2 className="headline">
        <span>Catastrophe Maritime :</span> Le Paquebot Titanic de la White Star
        Sombre dans l'Atlantique Nord
      </h2>

      <div className="telegraph-box">
        <span>
          DERNIER TÉLÉGRAMME : FEMMES ET ENFANTS D'ABORD DANS LES CANOTS DE
          SAUVETAGE - LE CARPATHIA SE PRÉCIPITE SUR LES LIEUX
        </span>
      </div>

      <div className="article-container">
        <div className="article-body">
          <p>
            Montréal, 15 avril (Notre correspondant maritime) - Une effroyable
            catastrophe a frappé l'orgueil de la marine moderne. Le RMS Titanic,
            fleuron de la White Star Line réputé insubmersible, a sombré dans
            les eaux glaciales de l'Atlantique Nord dans la nuit du 14 au 15
            avril, après avoir heurté un iceberg lors de son voyage inaugural de
            Southampton à New York.
          </p>

          <p>
            Selon les derniers télégrammes, le drame s'est joué en moins de
            trois heures. Le paquebot, qui transportait 2 202 âmes à son bord,
            aurait subi une brèche mortelle sur son flanc tribord. Malgré les
            efforts héroïques de l'équipage et la mobilisation du Carpathia,
            seuls 498 rescapés ont pu être comptabilisés à ce jour.
          </p>

          <p>Notre rédaction a recueilli le témoignage bouleversant d'une rescapée, Mme Louise Laroche : "Le choc fut si brutal que les passagers de troisième classe crurent à une avarie de machine. Quand l'ordre d'évacuation fut donné, les premières-classes avaient déjà pris possession des canots. La scène des violonistes jouant Nearer, My God, to Thee tandis que l'arrière du navire se dressait vers les cieux reste gravée à jamais dans ma mémoire."</p>
        </div>

        <div className="newspaper-image">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/RMS_Titanic_3.jpg/1200px-RMS_Titanic_3.jpg"
            alt="Le Titanic quittant le port de Southampton"
            style={{ width: '100%', height: 'auto' }}
          />
          <div className="image-caption">
            "Le colosse des mers" appareillant de Southampton le 10 avril 1912,
            ultime départ avant le drame - Photographie White Star Line
          </div>
        </div>
      </div>

      <div className="maritime-bulletin">
        <h3>Diagramme de Sankey</h3>
        <p>La première visualisation est un diagramme de Sankey qui met en évidence les liens
          entre les variables démographique des passagers.
        </p>
        {titanicData && <SankeyDiagram data={titanicData}></SankeyDiagram>}
      </div>

      <div className="maritime-bulletin">
        <h3>Waffle Chart</h3>
        <p>
          La deuxième visualisation consiste en une série de waffle chart où
          chaque unité (carré) représente un passager du Titanic...
        </p>
        <Waffle data={titanicData} />
      </div>

      <div className="maritime-bulletin">
        <h3>Stacked Barplot</h3>
        <p>
          La troisième visualisation est un stacked barplot qui présente
          l'analyse temporelle et le taux d'utilisation des canots de
          sauvetage.
        </p>
        {lifeboatsData && <StackedBarChart data={lifeboatsData} />}
      </div>

      <div className="maritime-bulletin">
        <h3>Boîtes à moustaches</h3>
        <p>
          La quatrième visualisation est représentée par des boîtes à moustaches
          et se décompose en trois étapes progressives pour explorer la répartition
          des passagers du Titanic selon leur classe, le prix des billets et leur survie,
          en fonction du port d’embarquement.
        </p>
        <p>
          Ces étapes vous guideront d’une vue globale vers une analyse détaillée.
        </p>
        {titanicData && <Boxplot data={titanicData} />}
      </div>

      <div className="maritime-bulletin">
        <h3>Small Multiple</h3>
        <p>
          La cinquième visualisation sera illustrée par un small multiple...
        </p>

        {lifeboatsData && (<StarboardPortPieChart data={lifeboatsData} />)}
      </div>

      <div className="maritime-bulletin">
        <h3>Pictogramme Statistique</h3>
        <p>
          La cinquième visualisation sera illustrée par un pictogramme
          statistique...
        </p>
        <PictographSection />
      </div>
    </div>
  );
}

export default App;
