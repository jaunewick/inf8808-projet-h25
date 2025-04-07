import { useState, useEffect } from 'react'
import DBReader from './services/dbReader'
import BoxplotSurvival from './components/boxplot/BoxplotSurvival'
import BoxplotClassSurvival from './components/boxplot/BoxplotClassSurvival';
import BoxplotPortClassSurvival from './components/boxplot/BoxplotPortClassSurvival';

function App() {
    const [data, setData] = useState(null)

    async function fetchData() {
        const data = await DBReader.getData();
        setData(data);
    }

    useEffect(() => {
        fetchData()
        console.log('fetched data')
    }, [data])

    return (
        <div className="vintage-newspaper">
            <header className="newspaper-header">
                <h1 className="newspaper-title">Le Journal Transatlantique</h1>
                <p className="newspaper-subtitle">15 avril 1912 • Vol. LXII • N° 108 • Prix : 1¢</p>
            </header>

            <h2 className="headline"><span>Catastrophe Maritime :</span> Le Paquebot Titanic de la White Star Sombre dans l'Atlantique Nord</h2>

            <div className="telegraph-box">
                DERNIER TÉLÉGRAMME : FEMMES ET ENFANTS D'ABORD DANS LES CANOTS DE SAUVETAGE - LE CARPATHIA SE PRÉCIPITE SUR LES LIEUX
            </div>

            <div className="article-container">
                <div className="article-body">
                    <p>Montréal, 15 avril (Notre correspondant maritime) - Une effroyable catastrophe a frappé l'orgueil de la marine moderne. Le RMS Titanic, fleuron de la White Star Line réputé insubmersible, a sombré dans les eaux glaciales de l'Atlantique Nord dans la nuit du 14 au 15 avril, après avoir heurté un iceberg lors de son voyage inaugural de Southampton à New York.</p>

                    <p>Selon les derniers télégrammes, le drame s'est joué en moins de trois heures. Le paquebot, qui transportait 2 202 âmes à son bord, aurait subi une brèche mortelle sur son flanc tribord. Malgré les efforts héroïques de l'équipage et la mobilisation du Carpathia, seuls 500 rescapés ont pu être comptabilisés à ce jour.</p>

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
                <p>La première visualisation est un diagramme de Sankey...</p>
            </div>

            <div className="maritime-bulletin">
                <h3>Waffle Chart</h3>
                <p>La deuxième visualisation consiste en une série de waffle chart où chaque unité (carré) représente un passager du Titanic...</p>
            </div>

            <div className="maritime-bulletin">
                <h3>Stacked Barplot</h3>
                <p>La troisième visualisation est un stacked barplot...</p>
            </div>

            <div className="maritime-bulletin">
                <h3>Boîtes à moustaches</h3>
                <p>La quatrième visualisation est représentée par des boîtes à moustaches...</p>
                {data && <BoxplotSurvival data={data} />}
                {data && <BoxplotClassSurvival data={data} />}
                {data && <BoxplotPortClassSurvival data={data} />}
            </div>

            <div className="maritime-bulletin">
                <h3>Pictogramme Statistique</h3>
                <p>La cinquième visualisation sera illustrée par un pictogramme statistique...</p>
            </div>

            <div className="maritime-bulletin">
                <h3>Small Multiple</h3>
                <p>La cinquième visualisation sera illustrée par un small multiple...</p>
            </div>
        </div>
    )
}

export default App