import React, { useEffect, useState } from 'react'
import { sankey, sankeyCenter, sankeyLinkHorizontal } from 'd3-sankey'
import { GENDER, AGE, EMBARKED, SIBSP, SURVIVED, CLASS } from '../constants/column-titles'
const MARGIN_X  = 10
const MARGIN_Y  = 10
const DEMOGRAPHIC_VARIABLES = [GENDER, CLASS, AGE, EMBARKED, SIBSP, SURVIVED]

const LINK_COLOR = "#DBCEBF"

export default function SankeyDiagram ({width, height, data}) {
    
    const [source, setSource] = useState(CLASS)
    const [target, setTarget] = useState(SURVIVED)
    
    const [nodes, setNodes] = useState([])
    const [links, setLinks] = useState([])
    const [labels, setLabels] = useState([])
    const [processedData, setProcessedData] = useState({})
    const [availableSource, setAvailableSource] = useState(DEMOGRAPHIC_VARIABLES.filter(v => v !== target))
    const [availableTarget, setAvailableTarget] = useState(DEMOGRAPHIC_VARIABLES.filter(v => v !== source))


    function getRandomColor() {
        var letters = '0123456789ABCDEF'
        var color = '#'
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    const sankeyGenerator = sankey()
        .nodeWidth(26)
        .nodePadding(29)
        .extent([
            [MARGIN_X, MARGIN_Y],
            [width - MARGIN_X, height - MARGIN_Y],
        ])
        .nodeId((node) => node.id)
        .nodeAlign(sankeyCenter)

    function createNodes(nodeName) {
        let uniqueNodes
        if (nodeName === AGE) {
            uniqueNodes = new Set(['child', 'adult'])
        } else {
            uniqueNodes = new Set(
                data?.map(passenger => passenger[nodeName])
             )
        }
        
       return Array.from(uniqueNodes).map(characteristic => ({id: characteristic}))
    }
    
    function processData() {
        const allNodes = createNodes(source).concat(createNodes(target))      
        const linkMap = new Map()
        data?.forEach(passenger => {
            const sourceNode = source === AGE ? (passenger[source] < 18 ? 'child': 'adult'): passenger[source]
            const targetNode = target === AGE ? (passenger[target] < 18 ? 'child': 'adult'): passenger[target]
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

    useEffect(() => {
        if (Object.keys(processedData).length !== 0) {
            const { nodes, links } = sankeyGenerator(processedData)
            setNodes(nodes.map((node) => {
                return (
                  <g key={node.index}>
                    <rect
                      height={node.y1 - node.y0}
                      width={sankeyGenerator.nodeWidth()}
                      x={node.x0}
                      y={node.y0}
                      stroke={"black"}
                      fill={getRandomColor()}
                      fillOpacity={0.8}
                      rx={0.9}
                    />
                  </g>
                )
            }))

            setLinks(links.map((link, i) => {
                const linkGenerator = sankeyLinkHorizontal()
                const path = linkGenerator(link)
                
                return (
                  <path
                    className='link'
                    key={i}
                    d={path}
                    stroke={LINK_COLOR}
                    fill="none"
                    strokeOpacity={0.3}
                    strokeWidth={link.width}
                  />
                )
            }))  
            
            setLabels(nodes.map((node, i) => {
                return (
                  <text
                    key={i}
                    x={node.x0 < width / 2 ? node.x1 + 6 : node.x0 - 6}
                    y={(node.y1 + node.y0) / 2}
                    dy="0.35rem"
                    textAnchor={node.x0 < width / 2 ? "start" : "end"}
                    fontSize={14}
                    fontWeight={400}
                  >
                    {node.id}: {node.value}
                  </text>
                )
              }))
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
        <div className="column">
            <div className="row">
                <div id="source-target-row">
                    <select 
                        value={source}
                        onChange={e => changeSource(e.target.value)}    
                    >
                        {availableSource.map((value) => <option value={value} key={value}>{value}</option>)}
                    </select>
                    <select 
                        value={target}
                        onChange={e => changeTarget(e.target.value)}
                    >
                        {availableTarget.map((value) => <option value={value} key={value}>{value}</option>)}
                    </select>
                </div>
            </div>
            <svg width={width} height={height}>
                {nodes}
                {links}
                {labels}
            </svg>
        </div>
    )   
}