import React, { useEffect, useState } from 'react'
import { sankey, sankeyCenter, sankeyLinkHorizontal } from 'd3-sankey'
import { GENDER, AGE, EMBARKED, SIBSP, SURVIVED, CLASS } from '../../constants/column-titles'
import Translate from '../../util/getTranslation'
import * as d3 from 'd3'
import d3Tip from 'd3-tip'
import './sankey.css'

const MARGIN_X  = 20
const MARGIN_Y  = 20
const WIDTH = 500
const HEIGHT = 500
const DEMOGRAPHIC_VARIABLES = [GENDER, CLASS, AGE, EMBARKED, SIBSP, SURVIVED]

const SOURCE_NODE_COLOR = "#E9BA24"
const TARGET_NODE_COLOR = "#344C65"

export default function SankeyDiagram ({data}) {
    
    const [source, setSource] = useState(CLASS)
    const [target, setTarget] = useState(SURVIVED)
    
    const [processedData, setProcessedData] = useState({})
    const [availableSource, setAvailableSource] = useState(DEMOGRAPHIC_VARIABLES.filter(v => v !== target))
    const [availableTarget, setAvailableTarget] = useState(DEMOGRAPHIC_VARIABLES.filter(v => v !== source))
    const translator = new Translate()

    const sankeyGenerator = sankey()
        .nodeWidth(32)
        .nodePadding(29)
        .extent([
            [MARGIN_X, MARGIN_Y],
            [WIDTH - MARGIN_X, HEIGHT - MARGIN_Y],
        ])
        .nodeId((node) => node.id)
        .nodeAlign(sankeyCenter)

    function createNodes(nodeName) {
        let uniqueNodes
        if (nodeName === AGE) {
            uniqueNodes = new Set(['enfant', 'adulte'])
        } else {
            uniqueNodes = new Set(
                data?.map(passenger => passenger[nodeName])
             )
        }
       return Array.from(uniqueNodes).map(characteristic => ({id: characteristic}))
    }

    function isChild(age) {
        return age < 18 ? 'enfant': 'adulte'
    }

    function processData() {
        const allNodes = createNodes(source).concat(createNodes(target))      
        const linkMap = new Map()
        data?.forEach(passenger => {
            const sourceNode = source === AGE ? isChild(passenger[source]) : passenger[source]
            const targetNode = target === AGE ? isChild(passenger[target]) : passenger[target]
            const link = linkMap.get(sourceNode + targetNode)
            if (link) {
                link.value += 1
            } else {
                linkMap.set(sourceNode + targetNode, {source: sourceNode, target: targetNode, value: 1})
            }
        })
        if (data) {
            setProcessedData({nodes: allNodes, links: Array.from(linkMap.values())})
        }
    }

    useEffect(() => {
        processData()
    }, [data])

    function drawNodes (data, tip) {
        d3.selectAll('.sankey-node').remove()
        d3.select('.sankey-diagram')
          .selectAll('.sankey-node')
          .data(data)
          .join('g')
          .attr('class', 'sankey-node')
          .append('rect')
          .on('mouseover', (e, n) => {
            tip.show({value: n.value}, e.currentTarget)
          })
          .on('mouseout', tip.hide)
    }

    function updateNodes () {
        
        d3.selectAll('.sankey-node')
          .select('rect')
          .attr('height', (n) => n.y1 - n.y0)
          .attr('width', (n) => sankeyGenerator.nodeWidth())
          .attr('x', (n) => n.x0)
          .attr('y', (n) => n.y0)
          .attr('stroke', "black")
          .attr('fill', (n) => n.x0 < WIDTH / 2 ? SOURCE_NODE_COLOR : TARGET_NODE_COLOR)
          .attr('opacity', 1.0)
          .attr('rx', 0.9)
          
    }

    function drawLinks (data, tip) {
        d3.selectAll('.sankey-links').remove()
        d3.select('.sankey-diagram')
        .selectAll('.sankey-links')
        .data(data)
        .join('g')
        .attr('class', 'sankey-links')
        .append('path')
        .on('mouseover', (e, n) => {
            tip.show({value: n.value}, e.currentTarget)
          })
        .on('mouseout', tip.hide)
    }

    function updateLinks () {
        const linkGenerator = sankeyLinkHorizontal()
        
        d3.selectAll('.sankey-links')
          .select('path')
          .attr('d', (l) => linkGenerator(l))
          .attr('fill', 'none')
          .style('stroke-opacity', 0.6)
          .style('stroke-width', (l) => l.width)
          .attr('stroke', SOURCE_NODE_COLOR)
    }

    function drawLabels(data) {
        d3.selectAll('.sankey-labels').remove()
        d3.select('.sankey-diagram')
          .selectAll('.sankey-labels')
          .data(data)
          .join('g')
          .attr('class', 'sankey-labels')
          .append('text')
    }

    function updateLabels() {
        
        d3.selectAll('.sankey-labels')
          .select('text')
          .attr('x', (n) => n.x0 < WIDTH / 2 ? n.x1 + MARGIN_X: n.x0 - MARGIN_X)
          .attr('y', (n) => (n.y1 + n.y0) / 2)
          .attr('dy', "0.34rem")
          .attr('font-size', 16)
          .attr('font-weight', 600)
          .attr('text-anchor', (n) => n.x0 < WIDTH / 2 ? "start" : "end")
          .text((n) => 
            translator.getTranslation(source, n.id) === n.id
                ? translator.getTranslation(target, n.id) 
                : translator.getTranslation(source, n.id))
        
    }

    function getContents (n) {
        const tooltip = d3.create('div')

        tooltip.append('div')
               .attr('id', 'tooltip-content')
               .text(`Passager(s): ${n.value}`)

        return tooltip.html()
    }

    useEffect(() => {
        if (Object.keys(processedData).length !== 0) {
            const { nodes, links } = sankeyGenerator(processedData)
            const tip = d3Tip().attr('class', 'd3-tip').html(function (node) { return getContents(node) })
            d3.select('.sankey-diagram').call(tip)  

            drawLinks(links, tip)
            updateLinks()

            drawNodes(nodes, tip)
            updateNodes()

            drawLabels(nodes)
            updateLabels()
            
        } 
    }, [processedData])

    useEffect(() => {
        processData()
    }, [source, target])

    function changeSource(newSource) {
        setAvailableTarget(DEMOGRAPHIC_VARIABLES.filter(v => v!== newSource))
        setSource(newSource)
    }

    function changeTarget(newTarget) {
        setAvailableSource(DEMOGRAPHIC_VARIABLES.filter(v => v!== newTarget))
        setTarget(newTarget)
    }

    return (
        <div className="sankey-container"> 
            <section className="story-section">
            <h2>Des passagers de tous les horizons</h2>
                <p>
                    Que ce soit pour donner un avenir meilleur à sa famille, pour vivre l'aventure 
                    d'une vie ou tout simplement prendre des vacances, monter à bord du Titanic était
                    une opportunité en or. Ce bateau écrivait l'histoire avant même son malheureux naufrage,
                    étant le plus gros navire de son époque. Sa réputation a attiré plus de 1000 passagers
                    de partout dans le monde, auquels un autre millier de membre de l'équipage se sont joint.
                    Voici un bref aperçu de cette population au destin tragique.     
                </p>
            </section>
  
            <section className="chart-section">
              <h3>Corrélation démographique des passagers</h3>
              <p className="chart-description">
                Ce graphique montre la corrélation entre les différentes variables démographiques 
                identifiant les passagers. On peut y voir les proportions démographiques du groupe 
                de voyageurs, ainsi que les liens qui les unissaient.
              </p>
              <div className="sankey">
                  <div className={"sankey-container "}>
                      <svg className="sankey-diagram maritime-bulletin" width={WIDTH} height={HEIGHT}>
                      </svg>
                  </div>
                  <div className="sankey-controls">
                        <select 
                              value={source}
                              onChange={e => changeSource(e.target.value)}                          
                         >
                              {availableSource.map((value) => <option value={value} key={value}>{translator.getTypeTranslation(value)}</option>)}
                        </select>
                        <select 
                              value={target}
                              onChange={e => changeTarget(e.target.value)}
                          >
                              {availableTarget.map((value) => <option value={value} key={value}>{translator.getTypeTranslation(value)}</option>)}
                        </select>
                    </div>
              </div>
              <div className="chart-analysis">
                <p>
                  L'analyse des corrélations nous donne une image de la distribution démographique:
                </p>
                <ul> 
                  <li>Une plus grande proportion de femmes ont survécu par rapport aux hommes</li>
                  <li>Une plus grande proportion d'enfant ont survécu par rapport aux adultes</li>
                  <li>Faire partie de l'équipage n'était pas avantageux pour la survie</li>
                  <li>Un très petit nombre de femmes faisaient parties de l'équipage</li> 
                  <li>Faire partie des classes les plus luxueuses procurait de meilleure chance de survie</li>                      
                </ul>
              </div>
            </section>
      </div>
    )   
}