var svgmargin = 80;
//var margin = {top: 40, right: 40, bottom: 40, left: 40};
var svgwidth = screen.width - svgmargin;
//var width = 1780 - margin.left - margin.right + leftPadding;
//var height = 880 - margin.top - margin.bottom;
var buttonheight = 160;
var svgheight = screen.height - svgmargin - buttonheight;
var leftPadding = 100;
var topPadding = 50;
var rightPadding = 150;
var bottomPadding = 150;
var middleMargin = 100;
//var bottomMargin = 5;
var barHeight = (svgheight-topPadding-middleMargin-bottomPadding)/2;
var logoMargin = 100;

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var maxPoints = new Array();
var matchData = [];
var usedTeamStats;
var usedSeason = 0;
var seasons = [];
var numberOfTeams = 20;
var numberOfMatches = 38;
var leftMatchday = 0;
var rightMatchday = 0; //The matchday until which it is visualized
var minSize = 0.5*((svgwidth-leftPadding-rightPadding)/numberOfTeams);
var maxSize = ((svgwidth-leftPadding-rightPadding)/numberOfTeams);

var svg; //The svg containing the whole visualization
var textsvg;
var teamNames;
var pointBars;
var newPointBars;
var teamLogos;
var goalsScored;
var newGoalsScored;
var goalsAgainst;
var newGoalsAgainst;
var matchdayText;
var prevMatchdayText;
var prevPositions = [];
var pointScale;
var pointAxis;
var pointGrid;
var goalScale;
var goalAxis;
var goalGrid;
var buttonPushed = 0;
var playing = 0;


d3.select("body").attr("background", "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/background.jpg");

svg = d3.select("#content")
		.append("svg:svg")
		.attr("width", svgwidth)
		.attr("height",svgheight);
//		.on("click", function(){
//			teamLogos.attr("opacity", 0.75);
//		});

textsvg = d3.select("#textsvg")
		.append("svg:svg")
		.attr("width", screen.width-svgmargin)
		.attr("height", 80);

$(function() {
  $("#dayslider").slider({
	  orientation: "horizontal",
//      range: "min",
	  range: true,
      step: 1,
//      value: 0,
      values: [0,0],
      min: 0,
      max: 38,
      slide: refreshSlider,
      change: refreshSlider
  });
});

function refreshSlider(){
	console.log("Value: " + $("#dayslider").slider("value"));
	if(!buttonPushed){
		leftMatchday = $("#dayslider").slider("values", 0);
		rightMatchday =  $("#dayslider").slider("values", 1);
	}
	buttonPushed = 0;
	console.log("Slided");
	newMatchDay();    
}

$(function() {
    $( "input[type=submit]" )
      .button();
  });

$(function() {
    $( "#radio" ).buttonset();
  });

function play(){
	if(!playing){
		playing = 1;
//		$( "#playpause" ).button( "option", "value", "Pause" );
		$("#playpause").prop('value', 'Pause');
//		button1Plus();
		button2Plus();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');
	}
}

//Is called when button "plus" is clicked
function button1Plus(){
	if(leftMatchday < rightMatchday){
		leftMatchday++;
		buttonPushed = 1;
//		$( "#dayslider" ).slider( "option", "value", rightMatchday );
		$( "#dayslider" ).slider("values", 0, leftMatchday );
//		$( "#dayslider" ).slider("values", 1, rightMatchday );
//		if(playing) window.setTimeout(button1Plus,1000);
//		newMatchDay();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');		
	}
	console.log("Pressed +");
}

//Is called when button "minus is clicked
function button1Minus(){
	if(leftMatchday > 0){
		leftMatchday--;
		buttonPushed = 1;
//		$( "#dayslider" ).slider( "option", "value", rightMatchday );
		$( "#dayslider" ).slider("values", 0, leftMatchday );
//		$( "#dayslider" ).slider("values", 1, rightMatchday );
//		newMatchDay();
	}
	console.log("Pressed -");
}

//Is called when button "plus" is clicked
function button2Plus(){
	if(rightMatchday < 38){
//		leftMatchday = rightMatchday;
		rightMatchday++;    		
		buttonPushed = 1;
//		$( "#dayslider" ).slider( "option", "value", rightMatchday );
//		$( "#dayslider" ).slider("values", 0, leftMatchday );
		$( "#dayslider" ).slider("values", 1, rightMatchday );
		if(playing){
			window.setTimeout(button2Plus,1000);
			button1Plus();
		}
//		newMatchDay();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');		
	}
	console.log("Pressed +");
}

//Is called when button "minus is clicked
function button2Minus(){
	if(rightMatchday > leftMatchday){
//		leftMatchday = rightMatchday;
		rightMatchday--;
		buttonPushed = 1;
//		$( "#dayslider" ).slider( "option", "value", rightMatchday );
//		$( "#dayslider" ).slider("values", 0, leftMatchday );
		$( "#dayslider" ).slider("values", 1, rightMatchday );
//		newMatchDay();
	}
	console.log("Pressed -");
}

start();


//Loads the data from a Google Spreadsheet and calls the visualize function
function start(){
	var ds = new Miso.Dataset({
		  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Data/PL_allseasons_matchday.csv',
//		  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Visualisatie3/Data/E0_1112_matchday_hazzled.csv',
		  delimiter : ';'
	});
	
	ds.fetch({
		success : function() {
			console.log("Data loaded succesfully...");
			console.log("Available Columns:" + this.columnNames());
			console.log("There are " + this.length + " rows");
			this.each(function(row) {
				data.push(row);
			});
			console.log(data.length);
			load(data, ds);
//			visualize(data, ds)
		},
		
		error : function() {
			console.log("Are you sure you are connected to the internet?");
		}
	});
}

function load(data, ds){
	loadData(data);
	visualize();
}

function loadData(data){
	for(var i = 0; i < data.length; i++){
		if(!contains(seasons, data[i]["Season"])){
			seasons.push(data[i]["Season"]);
			console.log("Season: " + data[i]["Season"]);
		}
	}
	setTeams(data);
	setteamStats(data);
	console.log("Number of teamStats entries: " + teamStats.length);
	setteamTotalStats();
//	console.log("Number of teamTotalStats entries: " + teamTotalStats.length);
	usedTeamStats = teamTotalStats[usedSeason][1];
	loadMatches(data);
	setMaxPoints();
//	console.log("Number of matches: " + matchData[0][1][0].length);
//	var match = findMatch("2011-2012", 10, "Arsenal");
//	console.log(match.HomeTeam + " vs " + match.AwayTeam);
	
}
	
//The main function
function visualize(data, ds) {

	pointScale = d3.scale.linear()
		.domain([0, d3.max(usedTeamStats, function(d) { return d[1][numberOfMatches][1]; })])
		.range([0, barHeight]);
	goalScale = d3.scale.linear()
		.domain([0, d3.max(usedTeamStats, function(d) { return Math.max(d[1][numberOfMatches][3],d[1][numberOfMatches][5]); })])
		.range([barHeight, 0]);
	
	textsvg.append("text")
		.text("The evolution of a Premier League season")
		.attr("x", 100)
		.attr("y", 65)
		.attr("font-family", "sans-serif")
		.attr("font-size", "50px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold");

	pointBars = svg.selectAll("rect.pointbar")
        	.data(usedTeamStats)
        	.enter()
        	.append("rect")
    		.attr("x", function(d, i) {
  	          return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("y", topPadding)
    		.attr("opacity",0.3)
			.attr("width", minSize);
//			.on("mouseover", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7);
//			})
//			.on("mouseout", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
//			});
	
	newPointBars = svg.selectAll("rect.newpointbar")
			.data(usedTeamStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
		        return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
			})
//			.attr("stroke-width", 3)
//			.attr("stroke-opacity", 1)
			.attr("opacity",0.85)
//			.attr("fill", "red")
			.attr("width", minSize);
	
	goalsScored = svg.selectAll("rect.goalsscored")
			.data(usedTeamStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
  	          	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("opacity",0.4)
			.attr("height", 0)
			.attr("width", minSize/2)
			.attr("fill", "#008000");
//			.on("mouseover", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
//			})
//			.on("mouseout", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
//			});
	newGoalsScored = svg.selectAll("rect.newgoalsscored")
			.data(usedTeamStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
		        	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
			})
			.attr("opacity",0.8)
			.attr("width", minSize/2)
			.attr("fill", "#008000");
	goalsAgainst = svg.selectAll("rect.goalsagainst")
			.data(usedTeamStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
		        	return leftPadding + (i * maxSize) + maxSize/2;
			})
			.attr("opacity",0.4)
			.attr("width", minSize/2)
			.attr("fill", "#FF0000");
//			.on("mouseover", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
//			})
//			.on("mouseout", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
//			});
	newGoalsAgainst = svg.selectAll("rect.goalsagainst")
			.data(usedTeamStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
		        	return leftPadding + (i * maxSize) + maxSize/2;
			})
			.attr("opacity",0.8)
			.attr("width", minSize/2)
			.attr("fill", "#FF0000");
	function makePointsAxis(){
		return d3.svg.axis()
			.scale(pointScale)
			.orient("left")
			.ticks(8);  //Set rough # of ticks		
	}
	var pointsAxis = makePointsAxis();
	pointAxis = svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftPadding-20) +","+topPadding+")")
		.attr("opacity", 0.5)
		.call(pointsAxis);
	pointGrid = svg.append("g")         
		.attr("transform", "translate("+ (leftPadding-20) +","+topPadding+")")
	    .attr("class", "grid")
	    .call(makePointsAxis()
	        .tickSize(-svgwidth, 0, 0)
	        .tickFormat("")
	    );
	
	function makeGoalsAxis(){
		return d3.svg.axis()
			.scale(goalScale)
			.orient("left")
			.ticks(8);
	}
	var goalsAxis =   makeGoalsAxis();
	goalAxis = svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftPadding-20) +","+(topPadding+barHeight+middleMargin)+")")
		.attr("opacity", 0.5)
		.call(goalsAxis);
	goalGrid = svg.append("g")         
		.attr("transform", "translate("+ (leftPadding-20) +","+(topPadding+barHeight+middleMargin)+")")
	    .attr("class", "grid")
	    .call(makeGoalsAxis()
	        .tickSize(-svgwidth, 0, 0)
	        .tickFormat("")
	    );

	setMatchdayText();
	
	teamNames = svg.selectAll("text.names")
			.data(usedTeamStats)
			.enter()
			.append("text")
			.text(function(d) {
				return d[0];
			})
			.attr("y", topPadding - 10)
			.attr("x", function(d, i) {
		          return leftPadding + (i *maxSize) + maxSize/2;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
//			.attr("fill", "grey")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	teamLogos = svg.selectAll("image.logo")
			.data(usedTeamStats)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {return getImage(d);})
			.attr("height", minSize)
			.attr("width", minSize)
			.attr("opacity", 0.85)
			.attr("y", topPadding + barHeight + (middleMargin-minSize)/2)
			.attr("x", function(d, i) {
			      return leftPadding + (i *maxSize);
			});
//			.append("svg:title")
//			.text(function(d) { return d[0]; });
//			.on("mouseover", function() {
//				d3.select(this).attr("opacity", 1);
//			})
//			.on("mouseout", function() {
//				d3.select(this).attr("opacity", 0.85);
//			});
//			.on("click", function() {
//				d3.select(this).attr("opacity", 1);
//			});;
	
	drawLines();
	addText();
		
	newMatchDay();
}

//Is called when the matchday is changed
function newMatchDay(){
	if(rightMatchday<39){
		matchdayText.remove();
		prevMatchdayText.remove();
		setMatchdayText();
		prevPositions = [];
		sortData();
		console.log("Prev mday: " + leftMatchday);
		console.log("Mday: " + rightMatchday);
		var div = d3.select("#content").append("div")   
		    .attr("class", "tooltip")               
		    .style("opacity", 0);
		teamLogos.transition()           
			.duration(1000)
			.attr("height", function(d) { 
				if(maxPoints[rightMatchday] == 0){
					return minSize
				}
				else{
					return minSize+(maxSize-minSize)*(d[1][rightMatchday][1]/maxPoints[rightMatchday])				
				}
			})
			.attr("width", function(d) { 
				if(maxPoints[rightMatchday] == 0){
					return minSize
				}
				else{
					return minSize+(maxSize-minSize)*(d[1][rightMatchday][1]/maxPoints[rightMatchday])				
				}
			})
			.attr("y", function(d, i) {
				var width;
				if(maxPoints[rightMatchday] == 0){
					width = minSize;
				}
				else{
					width = minSize+(maxSize-minSize)*(d[1][rightMatchday][1]/maxPoints[rightMatchday])				
				}
				return topPadding + barHeight + (middleMargin-width)/2;
			})
			.attr("x", function(d, i) {
				prevPositions.push([d[0], i]);
				var width;
				if(maxPoints[rightMatchday] == 0){
					width = minSize;
				}
				else{
					width = minSize+(maxSize-minSize)*(d[1][rightMatchday][1]/maxPoints[rightMatchday])				
				}
				return leftPadding + (i * maxSize) + (maxSize/2) - width/2;
			})//;
		teamLogos.on("mouseover", function(d, i) { 
				d3.select(this).style("opacity", 1);
        		var match = 0;
        		if(usedSeason == 0){
        			match = findMatch("2011-2012", rightMatchday, d[0]);	
        		}
        		if(usedSeason == 1){
        			match = findMatch("2012-2013", rightMatchday, d[0]);	
        		}
        		var postion = i;
        		var points = d[1][rightMatchday][1];
        		var goalsMade = d[1][rightMatchday][3];
        		var goalsAgainst = d[1][rightMatchday][5];
        		var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
        		div.transition()        
	        		.duration(200)      
	        		.style("opacity", 0.9);      
        		div.html("<b><big><big>" + d[0] + "</big></big></b><br/>" + "<i>Matchday: </i>" + "<b>" + rightMatchday + "</b><br/><i>Number of points: </i>" + "<b>" + points + "</b><br/>" + "<i>Goals made: </i>" + "<b>" + goalsMade + "</b><br/>" + "<i>Goals against: </i>" + "<b>" + goalsAgainst + "</b><br/>" + "<small><i>Last match: </i></small>" + "<br/>" + "   " + "<big><b>" + text + "</big></b>")  
	        		.style("left", (d3.event.pageX) + "px")     
//				        		.style("top", (d3.event.pageY - div.attr("height")) + "px");
        			.style("top", (d3.event.pageY - 125) + "px");		
			})                  
	        .on("mouseout", function(d) { 
        		d3.select(this).style("opacity", 0.85);
	            div.transition()        
	                .duration(500)      
	                .style("opacity", 0);   
	        });
		teamNames.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          return leftPadding + (i * maxSize) + maxSize/2;
			});
		pointBars.transition()           
			.duration(1000)
    		.attr("x", function(d, i) {
  	          	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("height", function(d) {
				if(leftMatchday < rightMatchday){
					return pointScale(d[1][leftMatchday][1]);					
				}
				else{
					return pointScale(d[1][rightMatchday][1]);						
				}
    		});
		newPointBars.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
			})
			.attr("y", function(d) {
				if(leftMatchday < rightMatchday){
					return topPadding + pointScale(d[1][leftMatchday][1]);					
				}
				else{
					return topPadding + pointScale(d[1][rightMatchday][1]);
				}
			})
			.attr("height", function(d) {
				return Math.abs(pointScale(d[1][rightMatchday][1]) - pointScale(d[1][leftMatchday][1]));
			});
		goalsScored.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
			})
			.attr("y", function(d){
				return svgheight - (barHeight - goalScale(d[1][leftMatchday][3])) - bottomPadding;
			})
			.attr("height", function(d) {
				return barHeight - goalScale(d[1][leftMatchday][3]);
			});
		newGoalsScored.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          	return leftPadding + (i * maxSize) + maxSize/2 - minSize/2;
			})
			.attr("y", function(d){
				if(leftMatchday < rightMatchday){
					return svgheight - (barHeight - goalScale(d[1][rightMatchday][3])) - bottomPadding;					
				}
				else{
					return svgheight - (barHeight - goalScale(d[1][leftMatchday][3])) - bottomPadding
				}
			})
			.attr("height", function(d) {
				return Math.abs(goalScale(d[1][leftMatchday][3]) - goalScale(d[1][rightMatchday][3]));
			});
		
		goalsAgainst.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		        return leftPadding + (i * maxSize) + maxSize/2;
			})
			.attr("y", function(d){
				return svgheight - (barHeight - goalScale(d[1][leftMatchday][5])) - bottomPadding;
			})
			.attr("height", function(d) {
				return barHeight - goalScale(d[1][leftMatchday][5]);
			});
		newGoalsAgainst.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
	          	return leftPadding + (i * maxSize) + maxSize/2;
			})
			.attr("y", function(d){
				if(leftMatchday < rightMatchday){
					return svgheight - (barHeight - goalScale(d[1][rightMatchday][5])) - bottomPadding;					
				}
				else{
					return svgheight - (barHeight - goalScale(d[1][leftMatchday][5])) - bottomPadding;	
				}
			})
			.attr("height", function(d) {
				return Math.abs(goalScale(d[1][leftMatchday][5]) - goalScale(d[1][rightMatchday][5]));
			});
		console.log("Matchday: " + rightMatchday);
	}
}

//Draws the vertical lines telling who wins what
function drawLines(){
	svg.append("line")
		.attr("x1" , leftPadding + maxSize*3)
		.attr("y1" , 0)
		.attr("x2" , leftPadding + maxSize*3)
		.attr("y2" , svgheight - bottomPadding)
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , leftPadding + maxSize*13)
		.attr("y1" , 0)
		.attr("x2" , leftPadding + maxSize*13)
		.attr("y2" , svgheight - bottomPadding)
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , leftPadding + maxSize*16)
		.attr("y1" , 0)
		.attr("x2" , leftPadding + maxSize*16)
		.attr("y2" , svgheight - bottomPadding)
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
}

//Draws the text telling who wins what
function addText(){
	svg.append("text")
		.text("RELEGATION")
		.attr("x", leftPadding + maxSize*1.5)
		.attr("y", topPadding - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("SAFE")
		.attr("x", leftPadding + maxSize*8)
		.attr("y", topPadding - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA EUROPE LEAGUE")
		.attr("x", leftPadding + maxSize*14.5)
		.attr("y", topPadding - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA CHAMPIONS LEAGUE")
		.attr("x", leftPadding + maxSize*18)
		.attr("y", topPadding - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("# points")
		.attr("x", leftPadding - 60)
		.attr("y", topPadding + barHeight + 15)
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	svg.append("text")
		.text("# goals +")
		.attr("x", leftPadding - 60)
		.attr("y", topPadding + barHeight + middleMargin - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr("fill", "green")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	svg.append("text")
		.text("# goals -")
		.attr("x", leftPadding - 60)
		.attr("y", topPadding + barHeight + middleMargin - 10)
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr("fill", "red")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
}

//Sets the matchday en previous matchday in the visualisation
function setMatchdayText(){
	prevMatchdayText = svg.append("text")
		.text("Left matchday: " + leftMatchday)
		.attr("x", leftPadding + maxSize*8)
		.attr("y", svgheight/3 - 20)
		.attr("font-family", "sans-serif")
		.attr("font-size", "30px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.55)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	matchdayText = svg.append("text")
		.text("Right matchday: " + rightMatchday)
		.attr("x", leftPadding + maxSize*8)
		.attr("y", svgheight/3 + 20)
		.attr("font-family", "sans-serif")
		.attr("font-size", "40px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.55)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
		
}

//Is called when the user selects another season
function changeSeason(season){	
	teamNames.remove();
	pointBars.remove();
	newPointBars.remove();
	teamLogos.remove();
	goalsScored.remove();
	newGoalsScored.remove();
	goalsAgainst.remove();
	newGoalsAgainst.remove();
	matchdayText.remove();
	prevMatchdayText.remove();
	pointAxis.remove();
	pointGrid.remove();
	goalAxis.remove();
	goalGrid.remove();
	maxPoints = [];
	if (season == 1112){
		console.log("Season 1112");
		usedTeamStats = teamTotalStats[0][1]
//		datakey = key1112;
	}
	if (season == 1213){
		console.log("Season 1213");
		usedTeamStats = teamTotalStats[1][1]
//		datakey = key1213;
	}
	setMaxPoints();
//	start();
	visualize();
}

//Returns the matches of 1 matchday
function returnOneMatchday(season, matchday, data){
	var oneMatchday = [];
	for (var i =0; i < data.length; i++){
		if(data[i]["Season"] == season){
			if(data[i]["Matchday"] == matchday){
				oneMatchday.push(data[i]);
			}			
		}
	}
	return oneMatchday;
}

//Fills in the teams of the teamStats and teamTotalStats variables
function setTeams(data){
	for (var j =0; j < seasons.length; j++){
		var matches = returnOneMatchday(seasons[j], 1, data);
		numberOfTeams = matches.length*2;
		numberOfMatches = (numberOfTeams-1)*2;
		var teamData = [];
		var teamTotalData = [];
		for (var i =0; i < matches.length; i++){
			teamData.push([matches[i]["HomeTeam"], new Array(numberOfMatches)]);
			teamData.push([matches[i]["AwayTeam"], new Array(numberOfMatches)]);
			teamTotalData.push([matches[i]["HomeTeam"], new Array(numberOfMatches)]);
			teamTotalData.push([matches[i]["AwayTeam"], new Array(numberOfMatches)]);
		}
		teamStats.push([seasons[j], teamData]);
		teamTotalStats.push([seasons[j], teamTotalData]);
	}
}

//Fills in the teamStats data
function setteamStats(data){
	for (var i =0; i < data.length; i++){
		if(data[i]["FTR"] == "H"){
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [3, data[i]["FTHG"], data[i]["FTAG"], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]], [0,0,0,0,0], [0,0,0,0,0]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [0, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]]]);
		}
		if(data[i]["FTR"] == "D"){
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [1, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [1, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0]]);
		}
		if(data[i]["FTR"] == "A"){
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [0, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [3, data[i]["FTAG"], data[i]["FTHG"], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]], [0,0,0,0,0], [0,0,0,0,0]]);
		}
	}
}

//Help function for setteamStats()
function giveteamStats(season, teamName, matchday, stats){
	//For every season
	for (var i =0; i < teamStats.length; i++){
		if(teamStats[i][0] == season){
			//For every team
			for (var j =0; j < teamStats[i][1].length; j++){
				if(teamStats[i][1][j][0] == teamName){
					teamStats[i][1][j][1][matchday] = stats;	
				}
			}
		}
	}
}

//Fills in the teamTotalStats data
function setteamTotalStats(){
	//For every season
	for(var i = 0; i<teamStats.length; i++){
		var season = teamStats[i][0];
		//For every team
		for(var j = 0; j<teamStats[i][1].length; j++){
			var teamName = teamStats[i][1][j][0];
			teamTotalStats[i][1][j][1][0] = [0, 0, 0, 0, 0, 0, [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]];
			teamTotalStats[i][1][j][1][1] = [teamStats[i][1][j][1][1][0], teamStats[i][1][j][1][1][0], teamStats[i][1][j][1][1][1], teamStats[i][1][j][1][1][1], teamStats[i][1][j][1][1][2], teamStats[i][1][j][1][1][2], teamStats[i][1][j][1][1][3], teamStats[i][1][j][1][1][3], teamStats[i][1][j][1][1][4], teamStats[i][1][j][1][1][4], teamStats[i][1][j][1][1][5], teamStats[i][1][j][1][1][5]];
//			giveteamTotalStats(teamName, 0, [0, 0, 0, 0, 0, 0, [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]]);
//			giveteamTotalStats(teamName, 1, [teamStats[i][1][1][0], teamStats[i][1][1][0], teamStats[i][1][1][1], teamStats[i][1][1][1], teamStats[i][1][1][2], teamStats[i][1][1][2], teamStats[i][1][1][3], teamStats[i][1][1][3], teamStats[i][1][1][4], teamStats[i][1][1][4], teamStats[i][1][1][5], teamStats[i][1][1][5]]);
			//For every matchday
			for(var l = 2; l<teamStats[i][1][j][1].length; l++){
				var totPoints = teamTotalStats[i][1][j][1][l-1][1] + teamStats[i][1][j][1][l][0];
				var totFgoals = teamTotalStats[i][1][j][1][l-1][3] + teamStats[i][1][j][1][l][1];
				var totAgoals = teamTotalStats[i][1][j][1][l-1][5] + teamStats[i][1][j][1][l][2];
				var totWodds = []
				for (var k = 0; k < teamStats[i][1][j][1][l][3].length; k++){
					totWodds.push(teamTotalStats[i][1][j][1][l-1][7][k] + teamStats[i][1][j][1][l][3][k])
				}
				var totDodds = []
				for (var k = 0; k < teamStats[i][1][j][1][l][4].length; k++){
					totDodds.push(teamTotalStats[i][1][j][1][l-1][9][k] + teamStats[i][1][j][1][l][4][k])
				}
				var totLodds = []
				for (var k = 0; k < teamStats[i][1][j][1][l][5].length; k++){
					totLodds.push(teamTotalStats[i][1][j][1][l-1][11][k] + teamStats[i][1][j][1][l][5][k])
				}
				teamTotalStats[i][1][j][1][l] = [teamStats[i][1][j][1][l][0], totPoints, teamStats[i][1][j][1][l][1], totFgoals, teamStats[i][1][j][1][l][2], totAgoals, teamStats[i][1][j][1][l][3], totWodds, teamStats[i][1][j][1][l][4], totDodds, teamStats[i][1][j][1][l][5], totLodds];
//				giveteamTotalStats(teamName, l, [teamStats[i][1][l][0], totPoints, teamStats[i][1][l][1], totFgoals, teamStats[i][1][l][2], totAgoals, teamStats[i][1][l][3], totWodds, teamStats[i][1][l][4], totDodds, teamStats[i][1][l][5], totLodds])
			}
			
		}
		
	}
}

//Help function for setteamTotalStats()
function giveteamTotalStats(teamName, matchday, stats){
	for (var i =0; i < teamTotalStats.length; i++){
		if(teamTotalStats[i][0] == teamName){
			teamTotalStats[i][1][matchday] = stats;	
		}
	}
}

function loadMatches(data){
	for (var j =0; j < seasons.length; j++){
		var matches = [];
		for (var k = 0; k <= numberOfMatches; k++){
			matches[k] = [];
		}
		for (var i =0; i < data.length; i++){
			if(data[i]["Season"] == seasons[j]){
				matches[data[i]["Matchday"]].push([data[i]["HomeTeam"], data[i]["AwayTeam"], data[i]["FTHG"], data[i]["FTAG"], data[i]["B365H"], data[i]["B365D"], data[i]["B365A"]]);
			}
		}
		matchData.push([seasons[j], matches]);
	}
}

function findMatch(season, matchday, team){
	var result = 0;
	for(var i = 0; i < matchData.length; i++){
		if(matchData[i][0] == season){
			for (var j = 0; j < matchData[i][1][matchday].length; j++){
				if(matchData[i][1][matchday][j][0] == team || matchData[i][1][matchday][j][1] == team){
					result = {HomeTeam: matchData[i][1][matchday][j][0], AwayTeam: matchData[i][1][matchday][j][1], FTHG: matchData[i][1][matchday][j][2], FTAG: matchData[i][1][matchday][j][3], OddsH: matchData[i][1][matchday][j][4], OddsD: matchData[i][1][matchday][j][5], OddsA: matchData[i][1][matchday][j][6]}
				}
			}
		}
	}
	return result;
}

//Calculates the maximum number of points for 1 matchday
function setMaxPoints(){
	//For every matchday
	for (var j = 0; j < usedTeamStats[0][1].length; j++){
		maxPoints[j] = usedTeamStats[0][1][j][1];
		//For every team
		for (var i =1; i < usedTeamStats.length; i++){
			if(usedTeamStats[i][1][j][1] > maxPoints[j]){
				maxPoints[j] = usedTeamStats[i][1][j][1];
			}			
		}
	}
}

//Returns the correct image for the club
function getImage(d){
	var club = d[0];
	var result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/notfound.png";
	switch(club){
		case "Arsenal": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Arsenal.png"; break; 
		case "Sunderland": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Sunderland.png"; break; 
		case "Fulham": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Fulham.png"; break; 
		case "Norwich": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Norwich.png"; break; 
		case "Newcastle": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Newcastle.png"; break; 
		case "Tottenham": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Tottenham.png"; break; 
		case "QPR": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/QPR.png"; break; 
		case "Swansea": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Swansea.png"; break; 
		case "Reading": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Reading.png"; break; 
		case "Stoke": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/StokeCity.png"; break; 
		case "West Brom": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/WestBromwich.png"; break; 
		case "Liverpool": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Liverpool.png"; break; 
		case "West Ham": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/WestHam.png"; break; 
		case "Aston Villa": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/AstonVilla.png"; break; 
		case "Man City": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/ManchesterCity.png"; break; 
		case "Southampton": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Southampton.png"; break; 
		case "Wigan": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Wigan.png"; break; 
		case "Chelsea": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Chelsea.png"; break; 
		case "Man United": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/ManchesterUnited.png"; break; 
		case "Everton": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Everton.png"; break; 
		case "Wolves": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Wolves.png"; break; 
		case "Blackburn": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/BlackburnRovers.png"; break; 
		case "Bolton": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Bolton.png"; break; 
		case "Bergen": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/mons.png"; break; 
		case "Oud-Heverlee Leuven": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/ohl.jpg"; break; 
		case "Club Brugge": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/club_brugge.png"; break; 
		case "Waasland-Beveren": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/waasland.png"; break; 
		case "Germinal": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/beerschot.png"; break; 
		case "Lokeren": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/lokeren.png"; break; 
		case "Kortrijk": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/kortrijk.png"; break; 
		case "Anderlecht": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/anderlecht.png"; break; 
		case "Mechelen": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/mechelen.png"; break; 
		case "Charleroi": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/charleroi.png"; break; 
		case "Genk": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/genk.png"; break; 
		case "Cercle Brugge": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/cercle.png"; break; 
		case "Gent": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/aagent.png"; break; 
		case "Lierse": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/lierse.png"; break; 
		case "Standard": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/standard.png"; break; 
		case "Waregem": result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/zulte.png"; break; 
	}	
	return result;
}

//Help function to sort the data
function compareData(data1,data2){
    if (data1[1][rightMatchday][1] > data2[1][rightMatchday][1]) return 1;
    if (data1[1][rightMatchday][1] == data2[1][rightMatchday][1]){
    	if((data1[1][rightMatchday][3] - data1[1][rightMatchday][5]) > (data2[1][rightMatchday][3] - data2[1][rightMatchday][5])){
    		return 1;
    	}
    	else if((data1[1][rightMatchday][3] - data1[1][rightMatchday][5]) < (data2[1][rightMatchday][3] - data2[1][rightMatchday][5])){
    		return -1
    	}
    	else{
    		return 0;    		
    	}
    }
    return -1;
}

//Sorts the all the data
function sortData(){
    teamLogos.sort(compareData).order();
    teamNames.sort(compareData).order();
    pointBars.sort(compareData).order();
    newPointBars.sort(compareData).order();
    goalsScored.sort(compareData).order();
    newGoalsScored.sort(compareData).order();
    goalsAgainst.sort(compareData).order();
    newGoalsAgainst.sort(compareData).order();
}

function contains(array, value){
	result = 0;
	for (var i=0; i < array.length; i++){
		if(array[i] == value) result = 1;
	}
	return result;
}