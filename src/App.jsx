import SankeyDiagram from "./components/Sankey/Sankey";
import { useState, useEffect } from "react";
import DBReader from "./services/dbReader";
import { StarboardPortPieChart } from "./components/StarboardPortPieChart/StarboardPortPieChart";
import Waffle from "./components/Waffle/Waffle";
import StackedBarChart from "./components/StackedBarChart/StackedBarChart";
import Boxplot from "./components/Boxplot/Boxplot";
import PictographSection from "./components/Pictograph/PictographSection";

import laurieImg from "./assets/laurie.png";
import danielImg from "./assets/daniel.png";
import huyvietImg from "./assets/huyviet.png";
import jacobImg from "./assets/jacob.png";
import melviceImg from "./assets/melvice.jpeg";
import thomasImg from "./assets/thomas.jpeg";

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
          DERNIER TÉLÉGRAMME: FEMMES ET ENFANTS D'ABORD DANS LES CANOTS DE
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

          <p>
            Notre rédaction a recueilli le témoignage bouleversant d'une
            rescapée, Mme Louise Laroche : "Le choc fut si brutal que les
            passagers de troisième classe crurent à une avarie de machine. Quand
            l'ordre d'évacuation fut donné, les premières-classes avaient déjà
            pris possession des canots. La scène des violonistes jouant Nearer,
            My God, to Thee tandis que l'arrière du navire se dressait vers les
            cieux reste gravée à jamais dans ma mémoire."
          </p>
        </div>

        <div className="newspaper-image">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/RMS_Titanic_3.jpg/1200px-RMS_Titanic_3.jpg"
            alt="Le Titanic quittant le port de Southampton"
            style={{ width: "100%", height: "auto" }}
          />
          <div className="image-caption">
            "Le colosse des mers" appareillant de Southampton le 10 avril 1912,
            ultime départ avant le drame - Photographie White Star Line
          </div>
        </div>
      </div>

      <div className="maritime-bulletin">
        {titanicData && <SankeyDiagram data={titanicData}></SankeyDiagram>}
      </div>

      <div className="maritime-bulletin">
        {titanicData && <Waffle data={titanicData} />}
      </div>

      <div className="maritime-bulletin">
        {lifeboatsData && <StackedBarChart data={lifeboatsData} />}
      </div>

      <div className="maritime-bulletin">
        {titanicData && <Boxplot data={titanicData} />}
      </div>

      <div className="maritime-bulletin">
        {lifeboatsData && <StarboardPortPieChart data={lifeboatsData} />}
      </div>

      <div className="maritime-bulletin">
        <PictographSection />
      </div>

      <footer className="newspaper-footer">
        <div className="footer-content">
          <div className="authors-section">
            <h3 className="authors-title">Les Auteurs</h3>
            <div className="authors-grid">
              {[
                { name: "Laurie Bédard-Côté", img: laurieImg },
                { name: "Daniel Giao", img: danielImg },
                { name: "Huy Viet Nguyen", img: huyvietImg },
                { name: "Jacob Taylor", img: jacobImg },
                { name: "Melvice Junior Guimfack", img: melviceImg },
                { name: "Thomas Thiboutot", img: thomasImg },
              ].map((author, index) => (
                <div key={index} className="author">
                  <img
                    src={author.img}
                    alt={author.name}
                    className="author-img"
                  />
                  <p className="author-name">{author.name}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="footer-text-section">
            <p className="footer-text">
              Conception et développement réalisé par l'équipe 6.
            </p>
            <p className="footer-text">
              Dans le cadre du cours de Visualisation de données INF8808, Hiver
              2025.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
