import React from 'react'
import BoxplotSurvivalHeader from './utils/BoxplotSurvivalHeader'
import BoxplotClassSurvivalHeader from './utils/BoxplotClassSurvivalHeader'
import BoxplotPortClassSurvivalHeader from './utils/BoxplotPortClassSurvivalHeader'
import BoxplotSurvival from './components/BoxplotSurvival'
import BoxplotClassSurvival from './components/BoxplotClassSurvival'
import BoxplotPortClassSurvival from './components/BoxplotPortClassSurvival'
import BoxplotFooter from './utils/BoxplotFooter'

function Boxplot({ data }) {
    return (
      <>
        <BoxplotSurvivalHeader />
        <BoxplotSurvival data={data} />
        <BoxplotClassSurvivalHeader />
        <BoxplotClassSurvival data={data} />
        <BoxplotPortClassSurvivalHeader />
        <BoxplotPortClassSurvival data={data} />
        <BoxplotFooter />
      </>
    )
}

export default Boxplot