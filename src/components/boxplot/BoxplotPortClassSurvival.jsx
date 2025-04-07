import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BoxplotPortClassSurvival({ data }) {
    const svgRef = useRef();
    const margin = { top: 40, right: 30, bottom: 150, left: 30 };
    const width = 1200 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    useEffect(() => {
        if (!data) return;

        const processedData = preprocessData(data);
        const ports = Array.from(new Set(processedData.map(d => d.port)));
        const sumstat = d3.group(processedData, d => d.port, d => d.class, d => d.survived);

        const svg = initializeSVG();
        const chart = createChartGroup(svg);
        const portWidth = width / ports.length - 20;

        ports.forEach((port, i) => {
            const portGroup = chart.append("g")
                .attr("transform", `translate(${i * (portWidth + 20)}, 0)`);

            const portData = sumstat.get(port);
            const classNames = Array.from(portData.keys());
            const survivalStatus = ['oui', 'non'];

            const { xScale, yScale, colorScale } = createScales(processedData, classNames, portWidth);

            drawAxes(portGroup, xScale, yScale, port, portWidth);
            drawBoxplots(portGroup, portData, xScale, yScale, colorScale, survivalStatus);
            drawJitterPoints(portGroup, portData, xScale, yScale, colorScale, survivalStatus);
            drawAnnotations(portGroup, processedData, port, height, portWidth);
        });

        chart.append("text")
            .attr("x", width / 2)
            .attr("y", height + 120)
            .style("text-anchor", "middle")
            .style("font-size", "14px")
            .text("Port d'embarquement");

        drawLegend(svg);

    }, [data, height, margin.left, margin.top, width]);

    const preprocessData = (data) => {
        const excludedClasses = ['engineering crew', 'victualling crew', 'restaurant staff', 'deck crew'];
        return data
            .filter(d =>
                d.embarked !== 'B' &&
                d.class &&
                d.fare &&
                !excludedClasses.includes(d.class)
            )
            .map(d => ({
                port: d.embarked === 'C' ? 'Cherbourg' : d.embarked === 'Q' ? 'Queenstown' : 'Southampton',
                survived: d.survived === 'yes' ? 'oui' : 'non',
                class: d.class === '1st' ? '1ère' : d.class === '2nd' ? '2ème' : d.class === '3rd' ? '3ème' : d.class,
                fare: +d.fare
            }));
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

    const createScales = (processedData, classNames, portWidth) => {
        const xScale = d3.scaleBand()
            .domain(classNames)
            .range([0, portWidth])
            .paddingInner(0.1)
            .paddingOuter(0.05);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(processedData, d => d.fare) + 20])
            .range([height, 0]);

        const colorScale = d3.scaleOrdinal()
            .domain(['oui', 'non'])
            .range(['teal', 'tomato']);

        return { xScale, yScale, colorScale };
    };

    const drawAxes = (chart, xScale, yScale, port, portWidth) => {
        chart.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale).tickSizeOuter(0));

        chart.append("g")
            .call(d3.axisLeft(yScale));

        chart.append("text")
            .attr("x", portWidth / 2)
            .attr("y", height + 40)
            .style("text-anchor", "middle")
            .text(`Port: ${port}`);
    };

    const drawBoxplots = (chart, portData, xScale, yScale, colorScale, survivalStatus) => {
        const boxWidthFactor = 0.25;
        const capWidth = 15;

        Array.from(portData).forEach(([className, survivalData]) => {
            survivalStatus.forEach(status => {
                const groupData = survivalData.get(status);
                if (!groupData) return;

                const values = groupData.map(d => d.fare).sort(d3.ascending);
                const q1 = d3.quantile(values, 0.25);
                const median = d3.quantile(values, 0.5);
                const q3 = d3.quantile(values, 0.75);
                const iqr = q3 - q1;
                const min = d3.max([values[0], q1 - 1.5 * iqr]);
                const max = d3.min([values[values.length - 1], q3 + 1.5 * iqr]);

                const xPos = xScale(className) + xScale.bandwidth() * (status === 'oui' ? 0.25 : 0.75);
                const boxWidth = xScale.bandwidth() * boxWidthFactor;

                chart.append("line")
                    .attr("x1", xPos)
                    .attr("x2", xPos)
                    .attr("y1", yScale(min))
                    .attr("y2", yScale(q1))
                    .attr("stroke", colorScale(status))
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke-width", 1.5);


                chart.append("line")
                    .attr("x1", xPos)
                    .attr("x2", xPos)
                    .attr("y1", yScale(q3))
                    .attr("y2", yScale(max))
                    .attr("stroke", colorScale(status))
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke-width", 1.5);


                chart.append("line")
                    .attr("x1", xPos - capWidth / 2)
                    .attr("x2", xPos + capWidth / 2)
                    .attr("y1", yScale(min))
                    .attr("y2", yScale(min))
                    .attr("stroke", colorScale(status))
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke-width", 1.5);

                chart.append("line")
                    .attr("x1", xPos - capWidth / 2)
                    .attr("x2", xPos + capWidth / 2)
                    .attr("y1", yScale(max))
                    .attr("y2", yScale(max))
                    .attr("stroke", colorScale(status))
                    .attr("stroke-opacity", 0.7)
                    .attr("stroke-width", 1.5);

                chart.append("rect")
                    .attr("x", xPos - boxWidth / 2)
                    .attr("y", yScale(q3))
                    .attr("width", boxWidth)
                    .attr("height", yScale(q1) - yScale(q3))
                    .attr("fill", colorScale(status))
                    .attr("fill-opacity", 0.7)
                    .attr("stroke", colorScale(status))
                    .attr("stroke-width", 1.5);

                chart.append("line")
                    .attr("x1", xPos - boxWidth / 2)
                    .attr("x2", xPos + boxWidth / 2)
                    .attr("y1", yScale(median))
                    .attr("y2", yScale(median))
                    .attr("stroke", colorScale(status))
                    .attr("stroke-width", 2);
            });
        });
    };

    const drawJitterPoints = (chart, portData, xScale, yScale, colorScale, survivalStatus) => {
        const jitterWidthFactor = 0.1;

        Array.from(portData).forEach(([className, survivalData]) => {
            survivalStatus.forEach(status => {
                const groupData = survivalData.get(status);
                if (!groupData) return;

                const xPos = xScale(className) + xScale.bandwidth() * (status === 'oui' ? 0.15 : 0.65);
                const jitterWidth = xScale.bandwidth() * jitterWidthFactor;

                groupData.forEach(d => {
                    chart.append("circle")
                        .attr("cx", xPos - jitterWidth / 2 + Math.random() * jitterWidth - 15)
                        .attr("cy", yScale(d.fare))
                        .attr("r", 2.5)
                        .attr("fill", colorScale(status))
                        .attr("opacity", 0.4);
                });
            });
        });
    };

    const drawAnnotations = (chart, processedData, port, height, portWidth) => {
        const totalSurvivors = processedData.filter(d => d.port === port && d.survived === 'oui').length;
        const totalNonSurvivors = processedData.filter(d => d.port === port && d.survived === 'non').length;

        chart.append("text")
            .attr("x", portWidth / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .html(`
                <tspan style="fill: teal;">Survivants: ${totalSurvivors}</tspan>, 
                <tspan style="fill: tomato;">Naufragés: ${totalNonSurvivors}</tspan>
            `);
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
            <h3>Étape 3 : Distribution des prix des billets par classe et port d'embarquement</h3>
            <svg
                ref={svgRef}
                width={width + margin.left + margin.right}
                height={height + margin.top + margin.bottom}
            />
        </div>
    );
}

export default BoxplotPortClassSurvival;