import { useState, useEffect } from 'react'
import DBReader from './services/dbReader'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SankeyDiagram from './components/sankey'

function App() {
  const [count, setCount] = useState(0)
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
    <>
      <h1>The Titanic Project</h1>
      <SankeyDiagram width={500} height={500} data={data}></SankeyDiagram>
    </>
  )
}

export default App
