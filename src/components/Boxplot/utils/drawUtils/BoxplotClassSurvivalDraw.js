import * as d3 from "d3";

export const drawAxes = (chart, xScale, yScale, width, height, margin) => {
    chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickSizeOuter(0));

    chart.append("g").call(d3.axisLeft(yScale));

    chart
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 105)
        .style("text-anchor", "middle")
        .text("Classe des passagers");

    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("Prix du Billet (USD)");
};

const showTooltipBox = (event, d) => {
    d3.select("#tooltip_class_box").remove();
    const container = d3
        .select(".boxplot-port-class-survival")
        .node()
        .getBoundingClientRect();

    d3.select(".boxplot-port-class-survival")
        .append("div")
        .attr("id", "tooltip_class_box")
        .style("position", "absolute")
        .style("left", `${event.clientX - container.left + 10}px`)
        .style("top", `${event.clientY - container.top - 240}px`)
        .style("background-color", "white")
        .style("border", "1px solid gray")
        .style("border-radius", "4px")
        .style("padding", "5px")
        .style("width", "16rem")
        .style("pointer-events", "none")
        .style("opacity", 1)
        .style("z-index", 1000)
        .html(d);
};

export const drawBoxplots = (
    chart,
    portData,
    xScale,
    yScale,
    colorScale,
    survivalStatus,
) => {
    const boxWidthFactor = 0.25;
    const capWidth = 15;

    Array.from(portData).forEach(([className, survivalData]) => {
        survivalStatus.forEach((status) => {
            const groupData = survivalData.get(status);
            if (!groupData) return;

            const values = groupData.map((d) => d.fare).sort(d3.ascending);
            const q1 = d3.quantile(values, 0.25);
            const median = d3.quantile(values, 0.5);
            const q3 = d3.quantile(values, 0.75);
            const iqr = q3 - q1;
            const lowerFence = d3.max([values[0], q1 - 1.5 * iqr]);
            const upperFence = d3.min([values[values.length - 1], q3 + 1.5 * iqr]);
            const min = values[0];
            const max = values[values.length - 1];

            const xPos =
                xScale(className) +
                xScale.bandwidth() * (status === "oui" ? 0.25 : 0.75);
            const boxWidth = xScale.bandwidth() * boxWidthFactor;

            const whiskerTooltipContent = `
                <strong>Survie :</strong> <span style="color: ${status === "oui" ? "#1D3557" : "#E63946"};">${status === "oui" ? "Oui" : "Non"}</span><br>
                <strong>Classe :</strong> ${className}<br>
                <strong>Valeurs principales :</strong><br>
                - 3e quartile (Q3) : $${q3.toFixed(2)}<br>
                - Médiane : $${median.toFixed(2)}<br>
                - 1er quartile (Q1) : $${q1.toFixed(2)}<br>
                <strong>Limites :</strong><br>
                - Limite supérieure : $${upperFence.toFixed(2)}<br>
                - Limite inférieure : $${lowerFence.toFixed(2)}<br>
                <strong>Valeurs aberrantes :</strong><br>
                - Max : $${max.toFixed(2)}<br>
                - Min : $${min.toFixed(2)}
            `;

            chart
                .append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", yScale(q1))
                .attr("y2", yScale(q1))
                .attr("stroke", colorScale(status))
                .attr("stroke-opacity", 0.7)
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mousemove", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mouseout", () => {
                    d3.select("#tooltip_class_box").remove();
                })
                .transition()
                .duration(800)
                .attr("y2", yScale(lowerFence));

            chart
                .append("line")
                .attr("x1", xPos)
                .attr("x2", xPos)
                .attr("y1", yScale(q3))
                .attr("y2", yScale(q3))
                .attr("stroke", colorScale(status))
                .attr("stroke-opacity", 0.7)
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mousemove", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mouseout", () => {
                    d3.select("#tooltip_class_box").remove();
                })
                .transition()
                .duration(800)
                .attr("y2", yScale(upperFence));

            chart
                .append("line")
                .attr("x1", xPos - capWidth / 2)
                .attr("x2", xPos + capWidth / 2)
                .attr("y1", yScale(lowerFence))
                .attr("y2", yScale(lowerFence))
                .attr("stroke", colorScale(status))
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mousemove", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mouseout", () => {
                    d3.select("#tooltip_class_box").remove();
                })
                .transition()
                .duration(1000)
                .attr("stroke-opacity", 0.7);

            chart
                .append("line")
                .attr("x1", xPos - capWidth / 2)
                .attr("x2", xPos + capWidth / 2)
                .attr("y1", yScale(upperFence))
                .attr("y2", yScale(upperFence))
                .attr("stroke", colorScale(status))
                .attr("stroke-opacity", 0)
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mousemove", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mouseout", () => {
                    d3.select("#tooltip_class_box").remove();
                })
                .transition()
                .duration(1000)
                .attr("stroke-opacity", 0.7);

            chart
                .append("rect")
                .attr("x", xPos - boxWidth / 2)
                .attr("y", yScale(0)) // Start from the bottom
                .attr("width", boxWidth)
                .attr("height", 0) // Start with no height
                .attr("fill", colorScale(status))
                .attr("fill-opacity", 0.7)
                .attr("stroke", colorScale(status))
                .attr("stroke-width", 1.5)
                .on("mouseover", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mousemove", (event) => {
                    showTooltipBox(event, whiskerTooltipContent);
                })
                .on("mouseout", () => {
                    d3.select("#tooltip_class_box").remove();
                })
                .transition()
                .duration(1000)
                .attr("y", yScale(q3))
                .attr("height", yScale(q1) - yScale(q3));
        });
    });
};

export const drawMedianLines = (
    chart,
    sumstat,
    xScale,
    yScale,
    colorScale,
    survivalStatus,
    height
) => {
    const boxWidthFactor = 0.25;

    Array.from(sumstat).forEach(([className, survivalData]) => {
        survivalStatus.forEach((status) => {
            const groupData = survivalData.get(status);
            if (!groupData) return;

            const values = groupData.map((d) => d.fare).sort(d3.ascending);
            const median = d3.quantile(values, 0.5);

            const xPos =
                xScale(className) +
                xScale.bandwidth() * (status === "oui" ? 0.25 : 0.75);
            const boxWidth = xScale.bandwidth() * boxWidthFactor;

            chart
                .append("line")
                .attr("x1", xPos - boxWidth / 2)
                .attr("x2", xPos + boxWidth / 2)
                .attr("y1", height) // Start from bottom
                .attr("y2", height)
                .attr("stroke", colorScale(status))
                .attr("stroke-width", 2)
                .attr("stroke-opacity", 0)
                .transition()
                .duration(800)
                .attr("y1", yScale(median))
                .attr("y2", yScale(median))
                .attr("stroke-opacity", 1);
        });
    });
};

export const drawJitterPoints = (
    chart,
    sumstat,
    xScale,
    yScale,
    colorScale,
    survivalStatus,
    height
) => {
    const jitterWidthFactor = 0.2;

    Array.from(sumstat).forEach(([className, survivalData]) => {
        survivalStatus.forEach((status) => {
            const groupData = survivalData.get(status);
            if (!groupData) return;

            const xPos =
                xScale(className) +
                xScale.bandwidth() * (status === "oui" ? 0.25 : 0.75);
            const jitterWidth = xScale.bandwidth() * jitterWidthFactor;

            groupData.forEach((d, i) => {
                chart
                    .append("circle")
                    .attr(
                        "cx",
                        xPos - jitterWidth / 2 + Math.random() * jitterWidth - 53,
                    )
                    .attr("cy", height) // Start from bottom
                    .attr("r", 2.5)
                    .attr("fill", colorScale(status))
                    .attr("opacity", 0)
                    .on("mouseover", (event) => {
                        const container = d3.select(".boxplot-class-survival").node().getBoundingClientRect();
                        d3.select(".boxplot-class-survival")
                            .append("div")
                            .attr("id", "tooltip_class_box")
                            .style("position", "absolute")
                            .style("background-color", "white")
                            .style("border", "1px solid gray")
                            .style("border-radius", "4px")
                            .style("padding", "5px")
                            .style("width", "14rem")
                            .style("pointer-events", "none")
                            .style("opacity", 1)
                            .html(
                                `
                    <strong>Survie :</strong> <span style="color: ${status === "oui" ? "#1D3557" : "#E63946"};">${status === "oui" ? "Oui" : "Non"}</span><br>
                    <strong>Classe :</strong> ${d.classed}<br>
                    <strong>Prix du billet :</strong> $${d.fare.toFixed(2)}
                    `,)
                        .style("left", `${event.clientX - container.left + 10}px`)
                        .style("top", `${event.clientY - container.top - 65}px`)
                    })
                    .on("mouseout", () => {
                        d3.select("#tooltip_class_box").remove();
                    })
                    .transition()
                    .delay(i * 2) // Staggered delay for each point
                    .duration(600)
                    .attr("cy", yScale(d.fare))
                    .attr("opacity", 0.4);
            });
        });
    });
};

export const drawAnnotations = (chart, sumstat, classNames, xScale, height) => {
    classNames.forEach((className) => {
        const totalSurvivors = sumstat.get(className)?.get("oui")?.length || 0;
        const totalNonSurvivors = sumstat.get(className)?.get("non")?.length || 0;

        chart
            .append("text")
            .attr("x", xScale(className) + xScale.bandwidth() / 2)
            .attr("y", height + 40)
            .attr("text-anchor", "middle")
            .style("fill", "#1D3557")
            .text(`Survivants: ${totalSurvivors}`);

        chart
            .append("text")
            .attr("x", xScale(className) + xScale.bandwidth() / 2)
            .attr("y", height + 60)
            .attr("text-anchor", "middle")
            .style("fill", "#E63946")
            .text(`Naufragés: ${totalNonSurvivors}`);
    });
};

export const drawLegend = (svg, width, margin) => {
    const legend = svg
        .append("g")
        .attr(
            "transform",
            `translate(${width + margin.left - 70}, ${margin.top})`,
        );

    legend
        .append("rect")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-dasharray", "2,2")
        .attr("width", 90)
        .attr("height", 65)
        .attr("x", 0)
        .attr("y", 0);

    legend
        .append("text")
        .attr("x", 50)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-weight", "semibold")
        .text("Survie");

    legend
        .append("rect")
        .attr("x", 10)
        .attr("y", 25)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#1D3557")
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#1D3557")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 1);

    legend
        .append("text")
        .attr("x", 30)
        .attr("y", 30)
        .attr("dy", "0.3em")
        .style("font-size", "12px")
        .text("Oui");

    legend
        .append("rect")
        .attr("x", 10)
        .attr("y", 45)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", "#E63946")
        .attr("fill-opacity", 0.7)
        .attr("stroke", "#E63946")
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 1);

    legend
        .append("text")
        .attr("x", 30)
        .attr("y", 50)
        .attr("dy", "0.3em")
        .style("font-size", "12px")
        .text("Non");
};