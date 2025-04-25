import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import {
  GENDER,
  AGE,
  EMBARKED,
  SIBSP,
  SURVIVED,
  CLASS,
} from "../../constants/columnTitles";
import Translate from "../../util/getTranslation";
import "./Sankey.css";

const MARGIN_X = 30;
const MARGIN_Y = 30;
const WIDTH = 600;
const HEIGHT = 600;
const DEMOGRAPHIC_VARIABLES = [GENDER, CLASS, AGE, EMBARKED, SIBSP, SURVIVED];

const SOURCE_NODE_COLOR = "#E9BA24";
const TARGET_NODE_COLOR = "#344C65";

export default function SankeyDiagram({ data }) {
  const [source, setSource] = useState(CLASS);
  const [target, setTarget] = useState(SURVIVED);
  const [processedData, setProcessedData] = useState({});
  const [availableSource, setAvailableSource] = useState(
    DEMOGRAPHIC_VARIABLES.filter((v) => v !== target),
  );
  const [availableTarget, setAvailableTarget] = useState(
    DEMOGRAPHIC_VARIABLES.filter((v) => v !== source),
  );
  const translator = new Translate();

  function createNodes(nodeName) {
    let uniqueNodes;
    if (nodeName === AGE) {
      uniqueNodes = new Set(["enfant", "adulte"]);
    } else {
      uniqueNodes = new Set(data?.map((passenger) => passenger[nodeName]));
    }
    return Array.from(uniqueNodes).map((characteristic) => ({
      id: characteristic,
    }));
  }

  function isChild(age) {
    return age < 18 ? "enfant" : "adulte";
  }

  function displayTooltip(event, d) {
    d3.selectAll(".tooltip").remove();
    const container = d3.select(".sankey-container").node().getBoundingClientRect();
    d3.select(".sankey-container")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid gray")
      .style("border-radius", "4px")
      .style("padding", "5px")
      .style("pointer-events", "none")
      .style("font-weight", "bold")
      .style("opacity", 1)
      .style("z-index", 1000)
      .style("left", event.clientX - container.left + 10 + "px")
      .style("top", event.clientY - container.top - 28 + "px")
      .html(`Passagers: ${d.value}`);
  }

  function processData() {
    const allNodes = createNodes(source).concat(createNodes(target));
    const linkMap = new Map();
    data?.forEach((passenger) => {
      const sourceNode =
        source === AGE ? isChild(passenger[source]) : passenger[source];
      const targetNode =
        target === AGE ? isChild(passenger[target]) : passenger[target];
      const link = linkMap.get(sourceNode + targetNode);
      if (link) {
        link.value += 1;
      } else {
        linkMap.set(sourceNode + targetNode, {
          source: sourceNode,
          target: targetNode,
          value: 1,
        });
      }
    });
    if (data) {
      setProcessedData({
        nodes: allNodes,
        links: Array.from(linkMap.values()),
      });
    }
  }

  function computeNodeDepths(nodes, links) {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, depth: 0 }]));
    
    links.forEach(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      if (targetNode.depth <= sourceNode.depth) {
        targetNode.depth = sourceNode.depth + 1;
      }
    });
    
    return Array.from(nodeMap.values());
  }

  function computeNodeValues(nodes, links) {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, value: 0 }]));
    
    links.forEach(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
      sourceNode.value += link.value;
      targetNode.value += link.value;
    });
    
    return Array.from(nodeMap.values());
  }

  function computeNodePositions(nodes) {
    const nodesByDepth = d3.group(nodes, d => d.depth);
    const maxDepth = d3.max(nodes, d => d.depth);
  
    const xScale = d3.scaleLinear()
      .domain([0, maxDepth])
      .range([MARGIN_X, WIDTH - MARGIN_X - 30]);
  
    nodesByDepth.forEach((depthNodes, depth) => {
      let totalValue = d3.sum(depthNodes, d => d.value);
      const availableHeight = HEIGHT - 2 * MARGIN_Y;
      const k = availableHeight / totalValue;
  
      let y = MARGIN_Y;
  
      depthNodes.forEach(node => {
        node.x0 = xScale(depth);
        node.x1 = node.x0 + 20;
        node.y0 = y;
        node.y1 = y + node.value * k;
        y = node.y1 + 10;
      });
    });
  
    return nodes;
  }
  
  function computeLinkPaths(links, nodes) {
    const nodeMap = new Map(nodes.map(node => [node.id, { ...node, sourceOffset: 0, targetOffset: 0 }]));
  
    return links.map(link => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);
  
      const sourceHeight = sourceNode.y1 - sourceNode.y0;
      const targetHeight = targetNode.y1 - targetNode.y0;
  
      const totalSourceLinks = d3.sum(
        links.filter(l => l.source === link.source),
        l => l.value
      );
      const totalTargetLinks = d3.sum(
        links.filter(l => l.target === link.target),
        l => l.value
      );
  
      const sy0 = sourceNode.y0 + sourceNode.sourceOffset;
      const ty0 = targetNode.y0 + targetNode.targetOffset;
  
      const ksy = sourceHeight / totalSourceLinks;
      const kty = targetHeight / totalTargetLinks;
  
      const linkHeight = link.value * Math.min(ksy, kty);
  
      const y0 = sy0 + linkHeight / 2;
      const y1 = ty0 + linkHeight / 2;
  
      sourceNode.sourceOffset += linkHeight;
      targetNode.targetOffset += linkHeight;
  
      return {
        ...link,
        sourceNode,
        targetNode,
        width: linkHeight,
        points: [
          { x: sourceNode.x1, y: y0 },
          { x: targetNode.x0, y: y1 }
        ]
      };
    });
  }
  
  function drawDiagram() {
    if (Object.keys(processedData).length === 0) return;

    let nodes = computeNodeDepths(processedData.nodes, processedData.links);
    nodes = computeNodeValues(nodes, processedData.links);
    nodes = computeNodePositions(nodes);
    const links = computeLinkPaths(processedData.links, nodes);

    d3.select(".sankey-diagram").selectAll("*").remove();

    const linkGroup = d3.select(".sankey-diagram")
      .append("g")
      .attr("class", "sankey-links");

    linkGroup.selectAll(".link")
      .data(links)
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("d", d => {
        const curvature = 0.5;
        const x0 = d.points[0].x;
        const x1 = d.points[1].x;
        const y0 = d.points[0].y;
        const y1 = d.points[1].y;
        const xi = d3.interpolateNumber(x0, x1);
        const x2 = xi(curvature);
        const x3 = xi(1 - curvature);
        return `M${x0},${y0}C${x2},${y0} ${x3},${y1} ${x1},${y1}`;
      })
      .attr("fill", "none")
      .style("stroke-opacity", 0.6)
      .style("stroke-width", d => Math.max(1, d.width))
      .attr("stroke", SOURCE_NODE_COLOR)
      .on("mouseover", (event, d) => {
          displayTooltip(event, d);
      })
      .on("mousemove", (event, d) => {
          displayTooltip(event, d);
      })
      .on("mouseout", () => {
          d3.selectAll(".tooltip").remove();
      });

    const nodeGroup = d3.select(".sankey-diagram")
      .append("g")
      .attr("class", "sankey-nodes");

    nodeGroup.selectAll(".node")
      .data(nodes)
      .enter()
      .append("rect")
      .attr("class", "node")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("stroke", "black")
      .attr("fill", d => d.x0 < WIDTH / 2 ? SOURCE_NODE_COLOR : TARGET_NODE_COLOR)
      .attr("opacity", 1.0)
      .attr("rx", 0.9)
      .on("mouseenter", (event, d) => {
        displayTooltip(event, d);
      })
      .on("mousemove", (event, d) => {
        displayTooltip(event, d);
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove();
      });

    // Draw labels
    const labelGroup = d3.select(".sankey-diagram")
      .append("g")
      .attr("class", "sankey-labels");

    labelGroup.selectAll(".label")
      .data(nodes)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => (d.x0 < WIDTH / 2 ? d.x1 + MARGIN_X : d.x0 - MARGIN_X))
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.34rem")
      .attr("font-size", 16)
      .attr("font-weight", 800)
      .attr("text-anchor", d => (d.x0 < WIDTH / 2 ? "start" : "end"))
      .attr("user-select", "none")
      .attr("pointer-events", "none")
      .text(d =>
        translator.getTranslation(source, d.id) === d.id
          ? translator.getTranslation(target, d.id)
          : translator.getTranslation(source, d.id)
      )
      .on("mouseenter", (event, d) => {
        displayTooltip(event, d);
      })
      .on("mousemove", (event, d) => {
        displayTooltip(event, d);
      })
      .on("mouseout", () => {
        d3.selectAll(".tooltip").remove();
      });
  }

  useEffect(() => {
    processData();
  }, [data]);

  useEffect(() => {
    if (Object.keys(processedData).length !== 0) {
      drawDiagram();
    }
  }, [processedData]);

  useEffect(() => {
    processData();
  }, [source, target]);

  function changeSource(newSource) {
    setAvailableTarget(DEMOGRAPHIC_VARIABLES.filter((v) => v !== newSource));
    setSource(newSource);
  }

  function changeTarget(newTarget) {
    setAvailableSource(DEMOGRAPHIC_VARIABLES.filter((v) => v !== newTarget));
    setTarget(newTarget);
  }

  return (
    <div className="container">
      <section className="story-section">
        <h2>Des passagers de tous les horizons</h2>
        <p>
          Que ce soit pour donner un avenir meilleur à sa famille, pour vivre
          l'aventure d'une vie ou tout simplement prendre des vacances, monter à
          bord du Titanic était une opportunité en or. Ce bateau écrivait
          l'histoire avant même son malheureux naufrage, étant le plus gros
          navire de son époque. Sa réputation a attiré plus de 1000 passagers de
          partout dans le monde, auquels un autre millier de membre de
          l'équipage se sont joint. Voici un bref aperçu de cette population au
          destin tragique.
        </p>
      </section>

      <section className="chart-section">
        <h3>Corrélation démographique des passagers</h3>
        <p className="chart-description">
          Ce graphique montre la corrélation entre les différentes variables
          démographiques identifiant les passagers. On peut y voir les
          proportions démographiques du groupe de voyageurs, ainsi que les liens
          qui les unissaient.
        </p>
        <div className="sankey">
          <div className={"sankey-container"} style={{ position: "relative"}}>
            <svg
              className="sankey-diagram maritime-bulletin"
              width={WIDTH}
              height={HEIGHT + 50}
            ></svg>
          </div>
          <div className="sankey-controls">
            <select
              value={source}
              onChange={(e) => changeSource(e.target.value)}
            >
              {availableSource.map((value) => (
                <option value={value} key={value}>
                  {translator.getTypeTranslation(value)}
                </option>
              ))}
            </select>
            <select
              value={target}
              onChange={(e) => changeTarget(e.target.value)}
            >
              {availableTarget.map((value) => (
                <option value={value} key={value}>
                  {translator.getTypeTranslation(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="chart-analysis">
          <p>
            L'analyse des corrélations nous donne une image de la distribution
            démographique:
          </p>
          <ul>
            <li>
              Une plus grande proportion de femmes ont survécu par rapport aux
              hommes
            </li>
            <li>
              Une plus grande proportion d'enfant ont survécu par rapport aux
              adultes
            </li>
            <li>
              Faire partie de l'équipage n'était pas avantageux pour la survie
            </li>
            <li>
              Un très petit nombre de femmes faisaient parties de l'équipage
            </li>
            <li>
              Faire partie des classes les plus luxueuses procurait de meilleure
              chance de survie
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}