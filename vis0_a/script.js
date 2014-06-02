var dataset = [];                        //Initialize empty array
for (var i = 0; i < 25; i++) {           //Loop 25 times
	var newNumber = Math.round(Math.random() * 25);  //New random number (0-30)
	dataset.push(newNumber);             //Add new number to array
}

var dataset3 = [
                [ 5,     20 ],
                [ 480,   90 ],
                [ 250,   50 ],
                [ 100,   33 ],
                [ 330,   95 ],
                [ 410,   12 ],
                [ 475,   44 ],
                [ 25,    67 ],
                [ 85,    21 ],
                [ 220,   88 ],
                [ 600,   150],
                ];

//Dynamic, random dataset
var dataset4 = [];
var numDataPoints = 50;
var xRange = Math.random() * 1000;
var yRange = Math.random() * 1000;

for (var i = 0; i < numDataPoints; i++) {
	var newNumber1 = Math.round(Math.random() * xRange);
	var newNumber2 = Math.round(Math.random() * yRange);
	dataset4.push([newNumber1, newNumber2]);
}

//Width and height
var w = 500;
var h = 300;
var barPadding = 1;
var padding = 30;

/*
//Generate paragraphs
d3.select("body").selectAll("p")
    .data(dataset)
    .enter()
    .append("p")
    .text(function(d) { 
        return "I can count up to " + d;
    })
    .style("color", function(d) {
        if (d > 15) {   //Threshold of 15
            return "red";
        } else {
      		return "black";
        }
    });

//Generate barchart using divs
d3.select("body").selectAll("div")
    .data(dataset)
    .enter()
    .append("div")
    .attr("class", "bar")
    .style("height", function(d) {
        var barHeight = d * 5;  //Scale up by factor of 5
        return barHeight + "px";
    });

//Generate different circles
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)   // <-- Here
            .attr("height", h); // <-- and here!

var circles = svg.selectAll("circle")
                 .data(dataset)
                 .enter()
                 .append("circle");

circles.attr("cx", function(d, i) {
            return (i * 50) + 25;
        })
        .attr("cy", h/2)
        .attr("r", function(d) {
            return d;
        })
        .attr("fill", "yellow")
        .attr("stroke", "orange")
        .attr("stroke-width", function(d) {
            return d/2;
        });
 */

//Barchart using svg's
var svg2 = d3.select("body")
.append("svg")
.attr("width", w)   // <-- Here
.attr("height", h); // <-- and here!



svg2.selectAll("rect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
			return i * (w / dataset.length);
		})
		.attr("y", function(d) {
			return h - (d*4);  //Height minus data value
		})
		.attr("width", w / dataset.length - barPadding)
		.attr("height", function(d) {
			return d * 4;  // <-- Times four!
		})
		.attr("fill", function(d) {
			return "rgb(0, 0, " + (d * 10) + ")";
		});

svg2.selectAll("text")
	.data(dataset)
	.enter()
	.append("text")
	.text(function(d) {
		return d;
	})
	.attr("x", function(d, i) {
		return i * (w / dataset.length) + (w / dataset.length - barPadding) / 2;
	})
	.attr("y", function(d) {
		return h - (d * 4) + 14;              // +15
	})
	.attr("font-family", "sans-serif")
	.attr("font-size", "11px")
	.attr("fill", "white")
	.attr("text-anchor", "middle");

for (var i = 0; i < dataset.length; i++) {
	console.log(dataset[i]);  //Print value to console
}

//Scatterplot (nummer 3)
var xScale = d3.scale.linear()
.domain([0, d3.max(dataset4, function(d) { return d[0]; })])
.range([padding, w - padding*2]);

var yScale = d3.scale.linear()
.domain([0, d3.max(dataset4, function(d) { return d[1]; })])
.range([h - padding, padding]);

var rScale = d3.scale.linear()
.domain([0, d3.max(dataset4, function(d) { return d[1]; })])
.range([2, 5]);



var svg3 = d3.select("body")
	.append("svg")
	.attr("width", w)
	.attr("height", h);

svg3.selectAll("circle")
	.data(dataset4)
	.enter()
	.append("circle")
	.attr("cx", function(d) {
		return xScale(d[0]);
	})
	.attr("cy", function(d) {
		return yScale(d[1]);
	})
	.attr("r", function(d) {
		return rScale(d[1]);
	});

svg3.selectAll("text")
	.data(dataset4)
	.enter()
	.append("text")
	.text(function(d) {
		return d[0] + "," + d[1];
	})
	.attr("x", function(d) {
		return xScale(d[0]);
	})
	.attr("y", function(d) {
		return yScale(d[1]);
	})
	.attr("font-family", "sans-serif")
	.attr("font-size", "11px")
	.attr("fill", "red");

var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient("bottom")
	.ticks(5);  //Set rough # of ticks

var yAxis = d3.svg.axis()
	.scale(yScale)
	.orient("left")
	.ticks(5);

svg3.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(0," + (h - padding) + ")")
	.call(xAxis);

svg3.append("g")
	.attr("class", "axis")
	.attr("transform", "translate(" + padding + ",0)")
	.call(yAxis);















