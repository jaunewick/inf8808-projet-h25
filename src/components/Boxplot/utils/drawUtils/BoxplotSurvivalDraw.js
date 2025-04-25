import * as d3 from "d3";

const showTooltipBox = (event, d) => {
    d3.select("#tooltip_box").remove();
    const container = d3.select(".boxplot-survival").node().getBoundingClientRect();

    const tooltipContent = (d) => `
        <strong>Survie :</strong> <span style="color: ${d[0] === "oui" ? "#1D3557" : "#E63946"};">${d[0] === "oui" ? "Oui" : "Non"}</span><br>
        <strong>Valeurs principales :</strong><br>
        - 3e quartile (Q3) : $${d[1].q3.toFixed(2)}<br>
        - Médiane : $${d[1].median.toFixed(2)}<br>
        - 1er quartile (Q1) : $${d[1].q1.toFixed(2)}<br>
        <strong>Limites :</strong><br>
        - Limite supérieure : $${d[1].upperFence.toFixed(2)}<br>
        - Limite inférieure : $${d[1].lowerFence.toFixed(2)}<br>
        <strong>Valeurs aberrantes :</strong><br>
        - Max : $${d[1].max.toFixed(2)}<br>
        - Min : $${d[1].min.toFixed(2)}
    `;

    d3.select(".boxplot-survival")
        .append("div")
        .attr("id", "tooltip_box")
        .style("position", "absolute")
        .style("left", `${event.clientX - container.left + 10}px`)
        .style("top", `${event.clientY - container.top - 240}px`)
        .style("width", "16rem")
        .style("background-color", "white")
        .style("border", "1px solid gray")
        .style("border-radius", "4px")
        .style("padding", "5px")
        .style("pointer-events", "none")
        .style("opacity", 1)
        .style("z-index", 1000)
        .html(tooltipContent(d))
};

export const drawAxes = (chart, xScale, yScale, width, height, margin) => {
    chart
        .append("g")
        .attr("transform", `translate(0,${height})`)
        .call(
            d3.axisBottom(xScale).tickFormat((d) => (d === "oui" ? "Oui" : "Non")),
        );

    chart
        .append("text")
        .attr("x", width / 2)
        .attr("y", height + 75)
        .style("text-anchor", "middle")
        .text("Survie");

    chart.append("g").call(d3.axisLeft(yScale));

    chart
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - height / 2)
        .style("text-anchor", "middle")
        .text("Prix du Billet (USD)");
};

export const drawBoxplots = (chart, sumstat, xScale, yScale) => {
    const boxWidth = 180;

    chart
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
        .attr("x", (d) => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 2)
        .attr("width", boxWidth)
        .attr("y", yScale(0)) // départ en bas
        .attr("height", 0) // départ sans hauteur
        .attr("stroke-width", 1.5)
        .attr("fill", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("fill-opacity", 0.7)
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mousemove", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mouseout", () => {
            d3.select("#tooltip_box").remove();
        })
        .transition()
        .duration(1000)
        .attr("y", (d) => yScale(d[1].q3))
        .attr("height", (d) => yScale(d[1].q1) - yScale(d[1].q3));

    chart
        .selectAll("upperWhiskers")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("x2", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("y1", (d) => yScale(d[1].q3))
        .attr("y2", (d) => yScale(d[1].upperFence))
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mousemove", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mouseout", () => {
            d3.select("#tooltip_box").remove();
        });

    chart
        .selectAll("lowerWhiskers")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("x2", (d) => xScale(d[0]) + xScale.bandwidth() / 2)
        .attr("y1", (d) => yScale(d[1].q1))
        .attr("y2", (d) => yScale(d[1].lowerFence))
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mousemove", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mouseout", () => {
            d3.select("#tooltip_box").remove();
        });

    chart
        .selectAll("upperCaps")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 4)
        .attr("x2", (d) => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 4)
        .attr("y1", (d) => yScale(d[1].upperFence))
        .attr("y2", (d) => yScale(d[1].upperFence))
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mousemove", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mouseout", () => {
            d3.select("#tooltip_box").remove();
        });

    chart
        .selectAll("lowerCaps")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 4)
        .attr("x2", (d) => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 4)
        .attr("y1", (d) => yScale(d[1].lowerFence))
        .attr("y2", (d) => yScale(d[1].lowerFence))
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 1.5)
        .on("mouseover", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mousemove", (event, d) => {
            showTooltipBox(event, d);
        })
        .on("mouseout", () => {
            d3.select("#tooltip_box").remove();
        });
};

export const drawMedianLines = (chart, sumstat, xScale, yScale, height) => {
    const boxWidth = 180;
    chart
        .selectAll("medianLines")
        .data(sumstat)
        .enter()
        .append("line")
        .attr("x1", (d) => xScale(d[0]) + xScale.bandwidth() / 2 - boxWidth / 2)
        .attr("x2", (d) => xScale(d[0]) + xScale.bandwidth() / 2 + boxWidth / 2)
        .attr("y1", height) // départ en bas
        .attr("y2", height)
        .attr("stroke", (d) => (d[0] === "oui" ? "#1D3557" : "#E63946"))
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0)
        .transition()
        .duration(800)
        .attr("y1", (d) => yScale(d[1].median))
        .attr("y2", (d) => yScale(d[1].median))
        .attr("stroke-opacity", 1);
};

export const drawJitterPoints = (chart, processedData, xScale, yScale, height) => {
    const jitterWidth = 110;
    chart
        .selectAll("points")
        .data(processedData)
        .enter()
        .append("circle")
        .attr(
            "cx",
            (d) =>
                xScale(d.survived) +
                xScale.bandwidth() / 2 -
                jitterWidth / 2 +
                Math.random() * jitterWidth -
                150,
        )
        .attr("cy", height)
        .attr("r", 2.5)
        .attr("fill", (d) => (d.survived === "oui" ? "#1D3557" : "#E63946"))
        .attr("opacity", 0)
        .on("mouseover", (event, d) => {
            const container = d3.select(".boxplot-survival").node().getBoundingClientRect();
            d3
                .select(".boxplot-survival")
                .append("div")
                .attr("id", "tooltip_point")
                .style("position", "absolute")
                .style("left", `${event.clientX - container.left + 10}px`)
                .style("top", `${event.clientY - container.top - 50}px`)
                .style("width", "14rem")
                .style("background-color", "white")
                .style("border", "1px solid gray")
                .style("border-radius", "4px")
                .style("padding", "5px")
                .style("pointer-events", "none")
                .style("opacity", 1)
                .html(
                    `
            <strong>Survie :</strong> <span style="color: ${d.survived === "oui" ? "#1D3557" : "#E63946"};">${d.survived === "oui" ? "Oui" : "Non"}</span><br>
            <strong>Prix du billet :</strong> $${d.fare.toFixed(2)}
            `,
                )
        })
        .on("mouseout", () => {
            d3.select("#tooltip_point").remove();
        })
        .transition()
        .delay((_, i) => i * 2)
        .duration(600)
        .attr("cy", (d) => yScale(d.fare))
        .attr("opacity", 0.4);
};

export const drawAnnotations = (chart, sumstat, processedData, xScale, height) => {
    const counts = Array.from(sumstat, ([key]) => ({
        survived: key,
        count: processedData.filter((d) => d.survived === key).length,
    }));

    chart
        .selectAll("annotations")
        .data(counts)
        .enter()
        .append("text")
        .attr("x", (d) => xScale(d.survived) + xScale.bandwidth() / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("fill", (d) => (d.survived === "oui" ? "#1D3557" : "#E63946"))
        .text(
            (d) =>
                `${d.survived === "oui" ? "Survivants" : "Naufragés"} : ${d.count}`,
        );
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