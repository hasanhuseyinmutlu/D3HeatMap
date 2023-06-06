document.addEventListener("DOMContentLoaded", function() {
  // Fetch data from the provided URL
  fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
    .then(response => response.json())
    .then(data => {
      const monthlyVariance = data.monthlyVariance;
      
      // Constants for the SVG dimensions and margins
      const width = 960;
      const height = 400;
      const margin = { top: 50, right: 50, bottom: 100, left: 100 };
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      // Create the SVG element
      const svg = d3.select("#heatmap")
        .attr("width", width)
        .attr("height", height);
        
      // Create the color scale for the heat map
      const colorScale = d3.scaleQuantile()
        .domain(d3.extent(monthlyVariance, d => data.baseTemperature + d.variance))
        .range(["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"]);

      // Create the x-axis scale and axis
      const xScale = d3.scaleLinear()
        .domain(d3.extent(monthlyVariance, d => d.year))
        .range([0, innerWidth]);
        
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))
        .ticks(20);
      
      // Create the y-axis scale and axis
      const yScale = d3.scaleBand()
        .domain(d3.range(12))
        .range([0, innerHeight]);

      const yAxis = d3.axisLeft(yScale)
        .tickFormat((d, i) => {
          const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
          return monthNames[i];
        });

      // Add the x-axis to the SVG
      svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${margin.left}, ${innerHeight + margin.top})`)
        .call(xAxis);

      // Add the y-axis to the SVG
      svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${margin.left}, ${margin.top})`)
        .call(yAxis);

      // Add the cells (rectangles) representing the data to the SVG
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      svg.selectAll("rect")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => data.baseTemperature + d.variance)
        .attr("x", d => xScale(d.year) + margin.left)
        .attr("y", d => yScale(d.month - 1) + margin.top)
        .attr("width", innerWidth / (d3.max(monthlyVariance, d => d.year) - d3.min(monthlyVariance, d => d.year) + 1))
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(data.baseTemperature + d.variance))
        .on("mouseover", function(d) {
          const tooltip = d3.select("#tooltip");
          const year = d.target.getAttribute("data-year"); // Get the data-year value
        
          tooltip.style("opacity", 0.9)
            .html(() => {
              const month = monthNames[d.target.getAttribute("data-month") - 1];
              const variance = d.target.getAttribute("data-temp") !== undefined ? parseFloat(d.target.getAttribute("data-temp")).toFixed(2) : 'N/A';
        
              return `Year: ${year}<br>
                Month: ${month}<br>
                Variance: ${variance}`;
            });
        
          const [x, y] = d3.pointer(event, this);
          tooltip.style("left", (x + 10) + "px")
            .style("top", (y + 10) + "px")
            .attr("data-year", year); // Set the data-year attribute
        })
        .on("mouseout", function(d) {
          const tooltip = d3.select("#tooltip");
          tooltip.style("opacity", 0)
            .attr("data-year", null); // Remove the data-year attribute
        });
        
        
      // Create the legend
      const legendColors = colorScale.range();
      const legendWidth = 200;
      const legendHeight = 20;
      
      const legendScale = d3.scaleLinear()
        .domain([d3.min(monthlyVariance, d => data.baseTemperature + d.variance), d3.max(monthlyVariance, d => data.baseTemperature + d.variance)])
        .range([0, legendWidth]);

      const legendAxis = d3.axisBottom(legendScale)
        .tickValues(colorScale.quantiles())
        .tickFormat(d3.format(".1f"))
        .tickSize(10)
        .tickSizeOuter(0);

      const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${margin.left}, ${height - margin.bottom + 30})`);

      legend.selectAll("rect")
        .data(legendColors)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * legendWidth / legendColors.length)
        .attr("y", 0)
        .attr("width", legendWidth / legendColors.length)
        .attr("height", legendHeight)
        .attr("fill", d => d);

      legend.append("g")
        .attr("transform", `translate(0, ${legendHeight})`)
        .call(legendAxis);
    });
});
