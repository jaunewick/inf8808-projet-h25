import React, { useEffect, useState } from 'react';
import { sankey, sankeyCenter, sankeyLinkHorizontal } from 'd3-sankey';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

const MARGIN_X  = 10;
const MARGIN_Y  = 10;

export default function SankeyDiagram ({width, height, data}) {
    const [source, setSource] = useState('class');
    const [target, setTarget] = useState('survived');
    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([])
    const [processedData, setProcessedData] = useState({})

    function getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
          color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
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
        const uniqueNodes = new Set(
           data.map(passenger => passenger[nodeName])
        )
       return Array.from(uniqueNodes).map(characteristic => ({id: characteristic}))
    }
    
    function processData() {
        const allNodes = createNodes(source).concat(createNodes(target));      

        const linkMap = new Map();
        data.forEach(passenger => {
            const sourceNode = passenger[source];
            const targetNode = passenger[target];
            const link = linkMap.get(sourceNode + targetNode);
            if (link) {
                link.value += 1
            } else {
                linkMap.set(sourceNode + targetNode, {source: sourceNode, target: targetNode, value: 1});
            }
        })
        setProcessedData({nodes: allNodes, links: Array.from(linkMap.values())});
    }

    useEffect(() => {
        if (Object.keys(processedData).length !== 0) {
            const { nodes, links } = sankeyGenerator(processedData);
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
                );
            }));

            setLinks(links.map((link, i) => {
                const linkGenerator = sankeyLinkHorizontal();
                const path = linkGenerator(link);
                
                return (
                  <path
                    key={i}
                    d={path}
                    stroke={"#344C65"}
                    fill="none"
                    strokeOpacity={0.3}
                    strokeWidth={link.width}
                  />
                );
            }));        
        }
    }, [processedData]);
 
    return (
            <div>
                <div className="row"></div>
                <button onClick={processData}>Process</button>
                <svg width={width} height={height}>
                    {nodes}
                    {links}
                </svg>
            </div>
    );   
}