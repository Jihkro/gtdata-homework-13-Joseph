// @TODO: YOUR CODE HERE!
// Declare widths and margins for SVG container

var svgWidth = 900;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create wrapper
var svg = d3.select("#scatter")
  .append("svg").attr("width", svgWidth).attr("height", svgHeight);

// Create chartgroup to hold charts and translate
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty"
var chosenYAxis = "obesity"


function xScale(data, chosenXAxis) {
  var xLinearScale = d3.scaleLinear().domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
    d3.max(data, d=> d[chosenXAxis])*1.2]).range([0,width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
  var yLinearScale = d3.scaleLinear().domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
    d3.max(data, d=> d[chosenYAxis])*1.2]).range([height,0]);

  return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition().duration(1000).call(bottomAxis);

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition().duration(1000).call(leftAxis);

  return yAxis;
}


function renderText(textGroup, newXScale, chosenXAxis, newYScale, yAxis) {

  textGroup.transition().duration(1000).attr("dx", d => newXScale(d[chosenXAxis])).attr("dy", d => newYScale(d[chosenYAxis])+5);

  return textGroup;
}

function renderMarkers(markersGroup, newXScale, chosenXAxis, newYScale, yAxis) {

  markersGroup.transition().duration(1000).attr("cx", d => newXScale(d[chosenXAxis])).attr("cy", d => newYScale(d[chosenYAxis]));

  return markersGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, markersGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age (Median)";
  }
  else {
    var xlabel = "Income";
  }

  if (chosenYAxis === "obesity") {
    var ylabel = "Obese (%)";
  }
  else if (chosenYAxis === "smokes"){
    var ylabel = "Smokes (%)";
  }
  else {
    var ylabel = "Lacks Healthcare";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
    });

  markersGroup.call(toolTip);

  markersGroup.on("mouseover", function(data){
    toolTip.show(data);
  }).on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  return markersGroup;
}

d3.csv("assets/data/datautf8.csv", function(data) {
//  if (err) throw err;

  //cast as numbers
  console.log("Loaded CSV");
  data.forEach(function(d) {
    d.poverty = +d.poverty;
    //d.povertyMoe = +d.povertyMoe;
    d.age = +d.age;
    //d.ageMoe = +d.ageMoe;
    d.income = +d.income;
    //d.incomeMoe = +d.incomeMoe;
    d.healthcare = +d.healthcare;
    //d.healthcareLow = +d.healthcareLow;
    //d.healthcareHigh = +d.healthcareHigh;
    d.obesity = +d.obesity;
    //d.obesityLow = +d.obesityLow;
    //d.obesityHigh = +d.obesityHigh;
    d.smokes = +d.smokes;
    //d.smokesLow = +d.smokesLow;
    //d.smokesHigh = +d.smokesHigh;
  });
  console.log("Finished casting as numbers");
  //xLinearScale
  var xLinearScale = xScale(data, chosenXAxis);

  var yLinearScale = yScale(data, chosenYAxis);

  var textGroup = chartGroup.selectAll("text")
      .data(data)

  textGroup = textGroup.enter()
      .append("text")
      .merge(textGroup)
      .attr("dx", d => xLinearScale(d[chosenXAxis]))
      .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
      .attr("text-anchor", "middle")
      .attr("textLength", "17px")
      .attr("lengthAdjust", "spacingAndGlyphs")
      .text(d => d.abbr);

  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);



  var markersGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("fill", "blue")
    .attr("opacity", ".7");




  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ylabelsGroup = chartGroup.append("g");

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty")
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age")
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income")
    .classed("inactive", true)
    .text("Household Income (Median)");


  var obeseLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese (%)")

  var smokesLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+20)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)")

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left + 40)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("Lacks Healthcare (%)")

  var markersGroup = updateToolTip(chosenXAxis, chosenYAxis, markersGroup);

  xlabelsGroup.selectAll("text")
    .on("click", function() {
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = xScale(data, chosenXAxis);
        xAxis = renderXAxes(xLinearScale, xAxis);
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        markersGroup = renderMarkers(markersGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        markersGroup = updateToolTip(chosenXAxis, chosenYAxis, markersGroup);

        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  ylabelsGroup.selectAll("text")
      .on("click", function() {
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {
          chosenYAxis = value;
          yLinearScale = yScale (data, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);
          textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          markersGroup = renderMarkers(markersGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
          markersGroup = updateToolTip(chosenXAxis, chosenYAxis, markersGroup);

          if (chosenYAxis === "obesity") {
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", false)
              .classed("inactive", true);
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
          }
        }
    });
});
