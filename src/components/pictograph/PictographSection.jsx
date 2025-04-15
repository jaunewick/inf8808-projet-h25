import React, { useEffect, useRef, useState } from "react";
import scrollama from "scrollama";
import Pictograph from "./Pictograph";
import SurvivalCalculator from "../../services/ProbabilityCalculator";
import PictographFilters from "./PictographFilters";
import "./Pictograph.css";

const PictographSection = () => {
  const [global, setGlobal] = useState(0);
  const [womanAdultProb, setWomanAdultProb] = useState(0);
  const [manAdultProb, setManAdultProb] = useState(0);
  const [childProb, setChildProb] = useState(0);
  
  const [firstClassProb, setFirstClassProb] = useState(0);
  const [secondClassProb, setSecondClassProb] = useState(0);
  const [thirdClassProb, setThirdClassProb] = useState(0);

  const [roseProb, setRoseProb] = useState(0);
  const [jackProb, setJackProb] = useState(0);

  const [currentStep, setCurrentStep] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    const scroller = scrollama();

    scroller
      .setup({
        step: ".step",
        offset: 0.6,
        progress: false,
      })
      .onStepEnter(response => {
        const step = response.element.getAttribute("data-step");
        setCurrentStep(step);
      });

    return () => scroller.destroy();
  }, []);

  useEffect(() => {
    const fetchSurvivalProbability = async () => {
      try {
        const womanAdultProbResult = await SurvivalCalculator.getSurvivalProbability({
          isChild: false,
          isMale: false,
        });
        setWomanAdultProb(womanAdultProbResult);

        const manAdultProbResult = await SurvivalCalculator.getSurvivalProbability({
          isChild: false,
          isMale: true,
        });
        setManAdultProb(manAdultProbResult);

        const childProbResult = await SurvivalCalculator.getSurvivalProbability({
          isChild: true,
        });
        setChildProb(childProbResult);

        const globalResult = await SurvivalCalculator.getSurvivalProbability();
        setGlobal(globalResult);

        const firstClassProbResult = await SurvivalCalculator.getSurvivalProbability({
          passengerClass: 1,
        });
        setFirstClassProb(firstClassProbResult);

        const secondClassProbResult = await SurvivalCalculator.getSurvivalProbability({
          passengerClass: 2,
        });
        setSecondClassProb(secondClassProbResult);

        const thirdClassProbResult = await SurvivalCalculator.getSurvivalProbability({
          passengerClass: 3,
        });
        setThirdClassProb(thirdClassProbResult);

        const roseProbResult = await SurvivalCalculator.getSurvivalProbability({
          isChild: false,
          isMale: false,
          passengerClass: 1,
          ageRange: [18, 25],
        });
        setRoseProb(roseProbResult);

        const jackProbResult = await SurvivalCalculator.getSurvivalProbability({
          isChild: false,
          isMale: true,
          passengerClass: 3,
          ageRange: [18, 25],
        });
        setJackProb(jackProbResult);

      } catch (error) {
        console.error("Error fetching survival probability:", error);
      }
    };

    fetchSurvivalProbability();
  }, []);

  return (
    <div className="pictograph-container scrollytelling" ref={scrollerRef}>
      {/* Introduction Section */}
      <section className="story-section">
        <h2>Survivre à bord : Une question de profil ?</h2>
        <p>
          Dans le chaos de la nuit du naufrage, les chances de survie ne dépendaient pas que de la chance... Le sexe,
          l’âge ou encore la classe du billet détenu pouvaient jouer un rôle crucial. Qui avait plus de chances d’être
          sauvé ? Qui, au contraire, voyait ses espoirs sombrer avec le navire ? Notre analyse permet de visualiser
          comment ces facteurs ont influencé le sort des passagers, en comparant les différences selon les profils.
        </p>
      </section>

      {/* Women, Child, Men */}
      <div className={`step ${currentStep === "gender" ? "is-active" : ""}`} data-step="gender">
        <section className="chart-section">
          <h3>Les femmes et les enfants d’abord ?</h3>
          <p className="section-description">
            C’est la fameuse règle de galanterie qu’on entend dans tous les récits de naufrage. On imagine les femmes
            serrant leurs enfants, guidées vers les canots pendant que les hommes restent en arrière, résignés. Cette
            règle a-t-elle vraiment été respectée ? Les femmes ont-elles été priorisées peu importe leur classe ? Et
            qu’en est-il des enfants: tous ont-ils eu les mêmes chances, riches ou pauvres ?
          </p>
        </section>
        <div className="pictograph-section" id="by_sex_all_classes">
          <div className="section-title">
            <p>Toutes classes confondues</p>
          </div>
          <div className="sub-section">
            <div>
              <p>Enfant</p>
              <Pictograph value={childProb} />
            </div>
            <div>
              <p>Femme</p>
              <Pictograph value={womanAdultProb} />
            </div>
            <div>
              <p>Homme</p>
              <Pictograph value={manAdultProb} />
            </div>
          </div>
          <div>
            <p>Globalement</p>
            <Pictograph value={global} />
          </div>
        </div>
        <div className="chart-analysis">
          <p>
            Cette visualisation révèle un constat frappant : les chances de survie dépendaient fortement du profil.
            Enfants et femmes ont été nettement avantagés, tandis que les hommes, eux, ont payé le plus lourd tribut.
            Une évacuation où la galanterie, réelle ou imposée, a clairement influencé le destin.
          </p>
        </div>
      </div>

      {/* Social Class */}
      <div className={`step ${currentStep === "class" ? "is-active" : ""}`} data-step="class">
        <section className="chart-section">
          <h3>Les privilèges ne s’arrêtaient-ils qu’au confort ?</h3>
          <p className="section-description">
          On savait déjà que voyager en première classe offrait un luxe inégalé, des cabines spacieuses aux repas raffinés. 
          Mais lors d’un naufrage, ces privilèges allaient bien au-delà du confort. Cette section explore les écarts de survie 
          entre les classes sociales à bord du Titanic. 
          La sécurité était-elle proportionnelle au prix du billet? Ou l'accès au salut était-il distribué équitablement, quelle que soit sa 
          place sur le navire?
          </p>
        </section>
        <div className="pictograph-section" id="by_sex_all_classes">
          <div className="section-title">
            <p>Tout genre confondu</p>
          </div>
          <div className="sub-section">
            <div>
              <p>1ère classe</p>
              <Pictograph value={firstClassProb} />
            </div>
            <div>
              <p>2e classe</p>
              <Pictograph value={secondClassProb} />
            </div>
            <div>
              <p>3e classe</p>
              <Pictograph value={thirdClassProb} />
            </div>
          </div>
          <div>
            <p>Globalement</p>
            <Pictograph value={global} />
          </div>
        </div>
        <div className="chart-analysis">
          <p>
          Cette visualisation met en lumière une vérité marquante : la classe sociale a joué un rôle déterminant dans les chances de survie.
          Les passagers de première classe ont eu des taux de survie nettement supérieurs, tandis que ceux de troisième classe, souvent plus jeunes et plus nombreux, ont été les plus vulnérables.
          Le prix du billet n’offrait pas seulement du confort… il pouvait aussi faire la différence entre la vie et la mort.
          </p>
        </div>
      </div>

      {/* Rose and Jack */}
      <div className={`step ${currentStep === "rosejack" ? "is-active" : ""}`} data-step="rosejack">
        <section className="chart-section ">
          <h3>Et Rose et Jack dans tout ça ?</h3>
          <p className="section-description">
            Qui n’a jamais entendu parler de Rose, passagère raffinée de première classe, et de Jack, jeune artiste sans billet, 
            monté à bord à la dernière seconde ? Leur romance dramatique est devenue l’icône du Titanic. Mais au-delà du cinéma, 
            leurs profils illustrent deux réalités bien différentes à bord : celle des classes privilégiées, proches des canots en
            1êre classe, et celle des passagers relégués dans les ponts inférieurs. Cette section met en lumière les écarts de survie
            entre Rose et Jack, révélant comment leur statut social a influencé leurs chances de survie.
          </p>
        </section>
        <div className="pictograph-section" id="by_sex_all_classes">
          <div className="sub-section">
            <div>
              <p>Rose (Femme entre 18 et 25 ans, 1ère classe)</p>
              <Pictograph value={roseProb} />
            </div>
            <div>
              <p>Jack (Homme entre 18 et 25 ans, 3e classe)</p>
              <Pictograph value={jackProb} />
            </div>
          </div>
        </div>
        <div className="chart-analysis">
          <p>
            Rose et Jack n’avaient pas les mêmes chances dès le départ.
            À âge égal, leur genre et leur classe sociale ont dicté leur sort : Rose avait presque toutes les cartes en main pour survivre, 
            là où Jack partait déjà perdant.Leur histoire symbolise à elle seule les inégalités profondes qui régnaient à bord du Titanic. 
            Et si le naufrage du Titanic était une tragédie… c’est peut-être aussi parce que, comme dans le film, il n’y avait pas de place pour deux sur le radeau.
          </p>
        </div>
      </div>

      
      {/* User's input*/}
      <div className={`step ${currentStep === "user" ? "is-active" : ""}`} data-step="user">
        <section className="chart-section ">
          <h3>Et vous, auriez-vous survécu ?</h3>
          <p className="section-description">
            Après avoir exploré les profils les plus emblématiques du Titanic: femmes, enfants, passagers de première ou troisième classe, Rose et Jack,
            il est temps de vous projeter vous-même à bord. En sélectionnant votre tranche âge, votre sexe et votre classe sociale, découvrez quelles auraient
            été vos chances de survie cette nuit-là. Une façon interactive de mesurer à quel point le destin pouvait basculer selon quelques critères seulement...
          </p>
        </section>
        <div className="pictograph-section" id="by_sex_all_classes">
            <PictographFilters />
        </div>
      </div>
    </div>
  );
};

export default PictographSection;