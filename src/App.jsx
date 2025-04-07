import "./App.css";
import SankeyDiagram from "./components/sankey/sankey";
import { StarboardPortPieChart } from "./components/StarboardPortPieChart/StarboardPortPieChart";
import { useState, useEffect } from 'react'
import DBReader from './services/dbReader'

function App() {
  const [count, setCount] = useState(0)
  const [data, setData] = useState(null)

  async function fetchData() {
    const data = await DBReader.getTitanicData();
    setData(data);
  }

  useEffect(() => {
      fetchData()
      console.log('fetched data')
  }, [data])

  return (
    <>
      <StarboardPortPieChart />

      <SankeyDiagram width={500} height={500} data={data}></SankeyDiagram>
    </>
  );
}

export default App;
