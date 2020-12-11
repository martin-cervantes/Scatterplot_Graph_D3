const getData = async () => {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json`, { mode: 'cors' });

    const data = await response.json();

    return data;
  } catch (error) {
    alert(error);
  }
  return false;
};


const drawGraph = async (info) => {
  const data = await info;

  const chartWidth = window.innerWidth - 20;
  const chartHeight = window.innerHeight - 100;
  const margin = {
    top: 60,
    left: 60,
    right: 20,
    bottom: 40
  };

  const plotHeight = chartHeight - margin.top - margin.bottom;
  const plotWidth = chartWidth - margin.left - margin.right;

  const svg = d3.select("#chart-area")
                .append("svg")
                .attr("viewBox", "0 0 800 600");

  const minRank = d3.min(data, d => d.Place);
  const maxRank = d3.max(data, d => d.Place);
  const rankScale = d3.scaleLinear()
                      .domain([maxRank + 2, minRank])
                      .range([plotHeight, 0]);

  const axisY = d3.axisLeft()
                  .scale(rankScale)
                  .ticks(10);

  svg.append("g")
     .attr("id", "y-axis")
     .call(axisY)
     .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  svg.append("text")
     .attr("text-anchor", "middle")
     .attr("x", margin.left / 2)
     .attr("y", margin.top + plotHeight / 2)
     .attr("transform",`rotate(-90 ${margin.left / 2},${margin.top + plotHeight / 2})`)
     .text("Rank");

  const minSec = d3.min(data, d => d.Seconds);
  const timeDifference = s => s - minSec;
  const minTimeDifference = d3.min(data, d => timeDifference(d.Seconds));
  const maxTimeDifference = d3.max(data, d => timeDifference(d.Seconds));

  const secondsScale = d3.scaleLinear()
          .domain([maxTimeDifference + 20, minTimeDifference])
          .range([0, plotWidth]); // Might need to change the 0

  const axisX = d3.axisBottom()

                  .scale(secondsScale)
                  .ticks(10);

  svg.append("g")
    .attr("id", "x-axis")
    .call(axisX)
    .attr("transform", "translate(" + margin.left + " ," + (chartHeight - margin.bottom) + ")");

  svg.append("text")
     .attr("text-anchor", "middle")
     .attr("x", margin.left + plotWidth / 2)
     .attr("y", chartHeight - margin.bottom / 4)
     .text("Seconds behind the fastest time");

  svg.append("g")
     .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
     .selectAll("circle")
     .data(data)
     .enter()
     .append("circle")
     .attr("class", "dot")
     .attr("cx", d => secondsScale(timeDifference(d.Seconds)))
     .attr("cy", d => rankScale(d.Place))
     .attr("r", 5)
     .attr("fill", d => {
        if (d.Doping === "") {
          return "teal";
        } else {
          return "tomato";
        }
      })
     .on("mouseover", (d, i) => {
       let dataAttr = `[data-id="${i}"]`;
       d3.select(dataAttr).style("font-weight", "bold");
       let dataTip = d3.select("#tooltip")
       .attr("data-year", d.Year);
       let infoHTML = `<p>Name: ${d.Name}</p>
       <p>${d.Year} - ${d.Nationality}</p>
       <p">${d.Doping}</p>`;
       dataTip.html(infoHTML).style("opacity", 1);
     })
    .on("mouseleave", (d, i) => {
      let dataAttr = `[data-id="${i}"]`;
      d3.select(dataAttr).style("font-weight", "normal");
      let dataTip = d3.select("#tooltip");
      dataTip.html("").style("opacity", 0);
    });

  svg.append("g")
     .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
     .selectAll("text")
     .data(data)
     .enter()
     .append("text")
     .attr("class", "label-text")
     .attr("text-anchor", d => {
        if (secondsScale(timeDifference(d.Seconds)) + 15 > 400) {
          return "end";
        } else {
          return "start";
        }
      })
     .attr('x', (d) => {
        if ((secondsScale(timeDifference(d.Seconds)) + 15) > 400) {
          return secondsScale(timeDifference(d.Seconds)) - 15
        } else {
          return secondsScale(timeDifference(d.Seconds)) + 15
        }
      })
     .attr('y', (d) => rankScale(d.Place) + 4)
     .attr('data-id', (d, i) => i)
     .text((d) => d.Name)
}


drawGraph(getData());
