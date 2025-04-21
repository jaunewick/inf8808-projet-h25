import React, {useRef, useState, useEffect} from 'react'
import scrollama from "scrollama";
import BoxplotSurvivalHeader from './utils/BoxplotSurvivalHeader'
import BoxplotClassSurvivalHeader from './utils/BoxplotClassSurvivalHeader'
import BoxplotPortClassSurvivalHeader from './utils/BoxplotPortClassSurvivalHeader'
import BoxplotSurvival from './components/BoxplotSurvival'
import BoxplotClassSurvival from './components/BoxplotClassSurvival'
import BoxplotPortClassSurvival from './components/BoxplotPortClassSurvival'
import BoxplotFooter from './utils/BoxplotFooter'

function Boxplot({ data }) {
  const scroller = useRef(null);
  const [currentStep, setCurrentStep] = useState(null);


  useEffect(() => {
      scroller.current = scrollama();
    
      scroller.current
        .setup({
          step: ".step-boxplot",
          offset: 0.6,
          progress: false,
        })
        .onStepEnter((response) => {
          const step = response.element.getAttribute("data-step");
          setCurrentStep(step);
        });
    
      return () => scroller.current.destroy();
    }, []); 
  
    return (
      <>
        <section className="step-boxplot" data-step="survival">
          <BoxplotSurvivalHeader />
          <BoxplotSurvival data={data} active={currentStep === "survival"} />
        </section>
        <section className="step-boxplot" data-step="classSurvival">
          <BoxplotClassSurvivalHeader />
          <BoxplotClassSurvival data={data} active={currentStep === "classSurvival"} />
        </section>
        <section className="step-boxplot" data-step="portClassSurvival">
          <BoxplotPortClassSurvivalHeader />
          <BoxplotPortClassSurvival data={data} active={currentStep === "portClassSurvival"} />
        </section>
        <BoxplotFooter />
      </>
    )
}

export default Boxplot