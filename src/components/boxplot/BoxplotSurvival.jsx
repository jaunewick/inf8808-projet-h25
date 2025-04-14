import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BoxplotSurvival({ data }) {
    const svgRef = useRef();
    const tooltipRef = useRef();
    const margin = { top: 40, right: 30, bottom: 80, left: 60 };
    const width = 1150 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    useEffect(() => {
        if (!data) return;

        const processedData = preprocessData(data);
        const sumstat = calculateStatistics(processedData);
        const svg = initializeSVG();
        const chart = createChartGroup(svg);
        const { xScale, yScale } = createScales(processedData);

        drawAxes(chart, xScale, yScale);
        drawBoxplots(chart, sumstat, xScale, yScale);
        drawMedianLines(chart, sumstat, xScale, yScale);
        drawJitterPoints(chart, processedData, xScale, yScale);
        drawAnnotations(chart, sumstat, processedData, xScale);
        drawLegend(svg);

    }, [data, height, margin.left, margin.right, margin.top, width]);

    const preprocessData = (data) => {
        const excludedClasses = ['engineering crew', 'victualling crew', 'restaurant staff', 'deck crew'];
        return data
            .filter(d =>
                d.embarked !== 'B' &&
                d.class &&
                d.fare &&
                !excludedClasses.includes(d.class) &&
                !isNaN(d.fare)
            )
            .map(d => ({
                survived: d.survived === 'yes' ? 'oui' : 'non',
                fare: +d.fare,
                class: d.class
            }));
    };

    const calculateStatistics = (processedData) => {
        const sumstat = d3.group(processedData, d => d.survived);
        sumstat.forEach((group, key) => {
            const values = group.map(d => d.fare).sort(d3.ascending);
            const q1 = d3.quantile(values, 0.25);
            const median = d3.quantile(values, 0.5);
            const q3 = d3.quantile(values, 0.75);
            const iqr = q3 - q1;

            sumstat.set(key, {
                q1,
                median,
                q3,
                lowerFence: d3.max([values[0], q1 - 1.5 * iqr]),
                upperFence: d3.min([values[values.length - 1], q3 + 1.5 * iqr]),
                min: values[0],
                max: values[values.length - 1],
                outliers: values.filter(d => d < (q1 - 1.5 * iqr) || d > (q3 + 1.5 * iqr))
            });
        });
        return sumstat;
    };

    const initializeSVG = () => {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
        return svg;
    };

    const createChartGroup = (svg) => {
        return svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
    };

    const createScales = (processedData) => {
        const xScale = d3.scaleBand()
            .domain(['oui', 'non'])
            .range([0, width])
            .paddingInner(0.5)
            .paddingOuter(0.3);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.fare) + 20])
            .range([height, 0]);

        return { xScale, yScale };
    };

    const drawAxes = (chart, xScale, yScale) => {
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d => d === 'oui' ? 'Oui' : 'Non'));

        chart.append("text")
            .attr("x", width / 2)
            .attr("y", height + 75)
            .style("text-anchor", "middle")
            .text("Survie");

        chart.append("g")
            .call(d3.axisLeft(yScale));

        chart.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left + 20)
            .attr("x", 0 - (height / 2))
            .style("text-anchor", "middle")
            .text("Prix du Billet (USD)");
    };

    const drawBoxplots = (chart, sumstat, xScale, yScale) => {
        const boxWidth = 180;
        const tooltip = d3.select(tooltipRef.current);

        const tooltipContent = (d) => `
            <strong>Survie :</strong> <span style="color: ${d[0] === 'oui' ? 'teal' : 'tomato'};">${d[0] === 'oui' ? 'Oui' : 'Non'}</span><br>
            <strong>Valeurs principales :</strong><br>
            - 3e quartile (Q3) : $${d[1].q3.toFixed(2)}<br>
            - Médiane : $${d[1].median.toFixed(2)}<br>
            - 1er quartile (Q1) : $${d[1].q1.toFixed(2)}<br>
            <strong>Limites :</strong><br>
            - Limite supérieure : $${d[1].upperFence.toFixed(2)}<br>
            - Limite inférieure : $${d[1].lowerFence.toFixed(2)}<br>
            <strong>Valeurs extrêmes :</strong><br>
            - Max (réel) : $${d[1].max.toFixed(2)}<br>
            - Min (réel) : $${d[1].min.toFixed(2)}
        `;

        chart.selectAll("boxes")
            .data(sumstat)
            .enter()
            .append("rect")
            .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 2)
            .attr("y", d => yScale(d[1].q3))
            .attr("width", boxWidth)
            .attr("height", d => yScale(d[1].q1) - yScale(d[1].q3))
            .attr("fill", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("fill-opacity", 0.7)
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(tooltipContent(d))
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        chart.selectAll("upperWhiskers")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr("y1", d => yScale(d[1].q3))
            .attr("y2", d => yScale(d[1].upperFence))
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(tooltipContent(d))
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        chart.selectAll("lowerWhiskers")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2)
            .attr("y1", d => yScale(d[1].q1))
            .attr("y2", d => yScale(d[1].lowerFence))
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(tooltipContent(d))
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        chart.selectAll("upperCaps")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => yScale(d[1].upperFence))
            .attr("y2", d => yScale(d[1].upperFence))
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(tooltipContent(d))
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });

        chart.selectAll("lowerCaps")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 4)
            .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 4)
            .attr("y1", d => yScale(d[1].lowerFence))
            .attr("y2", d => yScale(d[1].lowerFence))
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-width", 1.5)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(tooltipContent(d))
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    };

    const drawMedianLines = (chart, sumstat, xScale, yScale) => {
        const boxWidth = 180;
        chart.selectAll("medianLines")
            .data(sumstat)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 2)
            .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 2)
            .attr("y1", d => yScale(d[1].median))
            .attr("y2", d => yScale(d[1].median))
            .attr("stroke", d => d[0] === 'oui' ? 'teal' : 'tomato')
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 2);
    };

    const drawJitterPoints = (chart, processedData, xScale, yScale) => {
        const jitterWidth = 110;
        const tooltip = d3.select(tooltipRef.current);

        chart.selectAll("points")
            .data(processedData)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.survived) + xScale.bandwidth() / 2 - jitterWidth / 2 + Math.random() * jitterWidth - 150)
            .attr("cy", d => yScale(d.fare))
            .attr("r", 2.5)
            .attr("fill", d => d.survived === 'oui' ? 'teal' : 'tomato')
            .attr("opacity", 0.4)
            .on("mouseover", (event, d) => {
                tooltip.style("opacity", 1)
                    .html(`
                        <strong>Survie :</strong> <span style="color: ${d.survived === 'oui' ? 'teal' : 'tomato'};">${d.survived === 'oui' ? 'Oui' : 'Non'}</span><br>
                        <strong>Prix du billet :</strong> $${d.fare.toFixed(2)}
                    `)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 20}px`);
            })
            .on("mouseout", () => {
                tooltip.style("opacity", 0);
            });
    };

    const drawAnnotations = (chart, sumstat, processedData, xScale) => {
        const counts = Array.from(sumstat, ([key,]) => ({
            survived: key,
            count: processedData.filter(d => d.survived === key).length
        }));

        chart.selectAll("annotations")
            .data(counts)
            .enter()
            .append("text")
            .attr("x", d => xScale(d.survived) + xScale.bandwidth() / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("fill", d => d.survived === 'oui' ? 'teal' : 'tomato')
            .text(d => `${d.survived === 'oui' ? 'Survivants' : 'Naufragés'} : ${d.count}`);
    };

    const drawLegend = (svg) => {
        const legend = svg.append("g")
            .attr("transform", `translate(${width + margin.left - 70}, ${margin.top})`);

        legend.append("rect")
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-dasharray", "2,2")
            .attr("width", 90)
            .attr("height", 65)
            .attr("x", 0)
            .attr("y", 0);

        legend.append("text")
            .attr("x", 50)
            .attr("y", 15)
            .attr("text-anchor", "middle")
            .style("font-weight", "semibold")
            .text("Survie");

        legend.append("rect")
            .attr("x", 10)
            .attr("y", 25)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "teal")
            .attr("fill-opacity", 0.7)
            .attr("stroke", "teal")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 1);

        legend.append("text")
            .attr("x", 30)
            .attr("y", 30)
            .attr("dy", "0.3em")
            .style("font-size", "12px")
            .text("Oui");

        legend.append("rect")
            .attr("x", 10)
            .attr("y", 45)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", "tomato")
            .attr("fill-opacity", 0.7)
            .attr("stroke", "tomato")
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 1);

        legend.append("text")
            .attr("x", 30)
            .attr("y", 50)
            .attr("dy", "0.3em")
            .style("font-size", "12px")
            .text("Non");
    };

    return (
        <div className="maritime-bulletin">
            <h3>Étape 1: Distribution des prix des billets par survie</h3>
            <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom} />
            <div ref={tooltipRef} style={{
                position: 'absolute',
                backgroundColor: 'white',
                border: '1px solid gray',
                borderRadius: '4px',
                padding: '5px',
                pointerEvents: 'none',
                opacity: 0
            }} />
        </div>
    );
}

export default BoxplotSurvival;