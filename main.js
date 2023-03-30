"use strict"

/* Configuration variables: drawing */
let svgWidth = 575;
let svgHeight = 575;
let margin = 50;

/* Resize div to match width of visualization. */
d3.select("#container")
    .style("width", String(svgWidth) + "px");

/* Create drawing canvas */
let svg = d3.select("#canvas")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

/* Draw canvas border */
svg.append("rect")
    .attr("fill", "white")
    .attr("stroke", "#d3dff0")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("rx", 10)
    .attr("ry", 10);

/* Draw margin border. */
svg.append("rect")
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-dasharray", "5")
    .attr("x", margin)
    .attr("y", margin)
    .attr("width", svgWidth - margin * 2)
    .attr("height", svgHeight - margin * 2);



let data, happinessRange, minutesOnYoutube, tempRange, mancesterUnitedWon

(async function () {
    data = await d3.json("myYoutubeHabits.json").then(buildVisualization)
})();

function buildVisualization(dataset) {

    let happinessRange = d3.scaleLinear()
        .domain([0, 5])
        .range([margin, svgWidth - margin])
        ;

    let minutesOnYoutube = d3.scaleLinear()
        .domain([0, 250])
        .range([svgHeight - margin, margin]);

    /*** using d3's scaleThreshold to dictate what the range and domain should be based on temperature thresholds. Colors will depict temperature range.
     * Domain is the threshold for the three temp ranges being monitored. Inspiration from: https://www.d3indepth.com/scales/ ***/

    let tempRange = d3.scaleThreshold()
        .domain(["0°F", "35°F", "50°F"])
        .range(["#4682B4", "#4682B4", "#6495ED", "#CCCCFF"])
    console.log(tempRange.domain());

    function rectangleSymbol() {
        return d3.symbol()
            .type(d3.symbolSquare)
            .size(200)()


            ;
    }
    drawRectangles();

    function drawRectangles() {
        /***  Select all data points and bind the data ***/
        let rects = svg.selectAll(".rectangle")
            .data(dataset.filter(function (value) {
                return value.jobEffect === true;
            }));

        /***  Creates new rectangles for any data points that don't have a corresponding rectangle yet and uses a filter function to only be triggered when an object in dataset has a value of true for the variable jobEffect ***/
        rects.enter()
            .append("path")
            .attr("class", "rectangle")
            .attr("d", rectangleSymbol)
            .attr("opacity", 0.5)
            .attr("transform", function (value) {
                return "translate(" + happinessRange(value.xHappinessRating) + "," + minutesOnYoutube(value.yMinutesOnYoutube) + ")";
            })
            .attr("fill", function (value) {
                if (value.jobEffect === true) {
                    return "red";

                }
            });
    }


    let circles = svg.selectAll("circle")
        .data(dataset)
        .join("circle");


    circles.attr("r", 6)
        .attr("cx", function (value) {
            return happinessRange(value.xHappinessRating);
        })
        .attr("cy", function (value) {
            return minutesOnYoutube(value.yMinutesOnYoutube);
        })
        .attr("opacity", 0.75) // Set the opacity of the circle to 75%
        .attr("fill", function (value) {
            console.log("Average Temperature:", value.avgTemp);
            console.log("Temperature Color:", tempRange(value.avgTemp));
            return tempRange(value.avgTemp);
        })

    /*** function below is creating data labels as text for the circles based on the value of the eventDate variable ***/

    let dateLabels = svg.selectAll("text")
        .data(dataset)
        .join("text");

    dateLabels.attr("x", function (value) {
        return happinessRange(value.xHappinessRating);
    })
        .attr("y", function (value) {
            return minutesOnYoutube(value.yMinutesOnYoutube);
        })
        .attr("dx", -42)
        .attr("dy", 12)
        .attr("font-size", 7)
        .text(function (value) {
            return value.eventDate;
        });




    /**** label the axes ****/
    let xAxisLabel = svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", svgHeight - (margin / 1.8))
        .attr("text-anchor", "middle")
        .text("Happiness level scale");

    let xAxisLabel2 = svg.append("text")
        .attr("x", svgWidth / 2)
        .attr("y", svgHeight - (margin / 6))
        .attr("text-anchor", "middle")
        .text("💀 = 0 and 😃 = 5 ");

    let yAxisLabel = svg.append("text")
        .attr("x", -svgHeight / 2)
        .attr("y", margin / 2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "middle")
        .text("Time spent on Youtube in minutes")
        .attr("transform", "rotate(-90)");

    /**** label key graph coordinates ****/
    let originLabel = svg.append("text")
        .attr("x", margin)
        .attr("y", svgHeight - (margin / 2))
        .attr("text-anchor", "middle")
        .text("0");

    /* labels the max value of coordinates on the X axis */
    let xAxisMaxValue = svg.append("text")
        .attr("x", svgWidth - margin)
        .attr("y", svgHeight - (margin / 2))
        .attr("text-anchor", "end")
        .text("5");



    /***  labels the max value of coordinates on the Y axis ***/

    let yAxisMaxValue = svg.append("text")
        .attr("x", -margin)
        .attr("y", margin / 2)
        .attr("text-anchor", "end")
        .attr("alignment-baseline", "middle")
        .text("250")
        .attr("transform", "rotate(-90)");

    /***  I learned about the tooltip functionality from previous courses and researched a way to use the tool tip in the 
    d3.library. I thought it would make the data more intuitive for viewers. Here the function is just 
    pulling the values of the datasets for each circle and shows the user what these values are when hovered
    source: https://www.pluralsight.com/guides/create-tooltips-in-d3js
    https://stackoverflow.com/questions/11462029/adding-a-title-attribute-to-svgg-element-in-d3-js ***/
    circles.append("title")
        .text(function (value) {
            return "Date: " + value.eventDate + "\nMinutes on Youtube: " + value.yMinutesOnYoutube + "\nOutcome of Manchester Utd game: " + value.manchesterUnitedWon + "\nAverage Temperature: " + value.avgTemp;
        })
        ;

    drawTriangles();

    /***  draws a triangle that will only show where whether manchesterunited variable in dataset is either true or false
     inspiration: https://www.geeksforgeeks.org/d3-js-symboltriangle-symbol/***/
    function triangleSymbol() {
        return d3.symbol()
            .type(d3.symbolTriangle)
            .size(32)();
    }
    function drawTriangles() {
        /*** Selects all data point and binds the data within the parameter of mancesterUnitedWon's value. If it falls on either prerequisite ex. true or false then it's given a different color on wheter the value is true or false ***/
        let triangles = svg.selectAll(".triangle")
            .data(dataset.filter(function (value) { return value.manchesterUnitedWon === "Won" || value.manchesterUnitedWon === "Lost"; }));

        /***  Create new triangles for any data points that don't have a corresponding triangle yet ***/
        triangles.enter()
            .append("path")
            .attr("class", "triangle")
            .attr("d", triangleSymbol)
            .attr("transform", function (value) {
                return "translate(" + happinessRange(value.xHappinessRating) + "," + minutesOnYoutube(value.yMinutesOnYoutube) + ")";
            })
            .attr("fill", function (value) {
                if (value.manchesterUnitedWon === "Lost") {
                    return "black";
                } else {
                    return "white";
                }
            });

        /*** creates a separate SVG element for the key ***/
        let keySvg = d3.select("body")
            .append("svg")
            .attr("width", 400)
            .attr("height", 450)
            .style("position", "absolute")
            .style("top", "50%")
            .style("left", "17%")
            .style("transform", "translate(-50%, -50%)");

        /*** text for key title ***/
        let keyTitle = keySvg.append("text")
            .attr("x", 230)
            .attr("y", 45)
            .attr("text-anchor", "middle")
            .text("Temperature Ranges");


        /*** this defines the domain and ranges for the scale function  ***/
        let tempRange = d3.scaleThreshold()
            .domain([0, 35, 50])
            .range(["#4682B4", "#6495ED", "#CCCCFF"]);

        /*** this defines the rectangles within the scale that are related to the tempRange function's domain  ***/

        let keyScale = keySvg.selectAll("rect")
            .data(tempRange.range())
            .join("rect")
            .attr("x", function (d, i) { return i * 50; })
            .attr("y", 30)
            .attr("width", 50)
            .attr("height", 20)
            .attr("fill", function (d) { return d; });

        /*** adding lables to each rectangle in the key ***/


        let keyLabels = keySvg.selectAll("text.label")
            .data(tempRange.domain())
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", function (d, i) { return i * 50 + 14; })
            .attr("y", 75)
            .attr("text-anchor", "middle")
            .text(function (d) { return d + "°F"; });


        /*** adding shapes and their meaning to the key ***/

        let circleKey = keySvg.append("circle")
            .join("circle")
            .attr("cx", 12)
            .attr("cy", 120)
            .attr("r", 8)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2);

        let circleLabel = keySvg.append("text")
            .attr("x", 32)
            .attr("y", 125)
            .text("Represents the temperature of the day ")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", "14px");

        let triangleBlack = keySvg.append("polygon")
            .attr("points", "100,70 120, 80 100,90")
            .attr("fill", "black")
            .attr("transform", "rotate(-90, 100, 70)")
            .attr("transform", "translate(-90, 90) rotate(-90, 100, 80)");

        let triangleLabel = keySvg.append("text")
            .attr("x", 32)
            .attr("y", 165)
            .text("Manchester United drew/lost on this day")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", "14px");

        let triangleWhite = keySvg.append("polygon")
            .attr("points", "100,70 120,80 100,90")
            .attr("fill", "white")
            .attr("transform", "rotate(-90, 100, 70) scale(.75)")
            .attr("transform", "translate(-88, 135) rotate(-90, 100, 80)")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            ;

        let triangleLabel2 = keySvg.append("text")
            .attr("x", 32)
            .attr("y", 210)
            .text("Manchester United won on this day")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", "14px");

        let rectangleKey = keySvg.append("rect")
            .join("rect")
            .attr("x", 4)
            .attr("y", 245)
            .attr("height", 18)
            .attr("width", 18)
            .attr("fill", "red")
            .attr("opacity", 0.5);

        let rectangleLabel = keySvg.append("text")
            .attr("x", 32)
            .attr("y", 260)
            .text("Outcome of job search had an effect on mood")
            .attr("text-anchor", "start")
            .attr("fill", "black")
            .attr("font-size", "14px");





    }
}