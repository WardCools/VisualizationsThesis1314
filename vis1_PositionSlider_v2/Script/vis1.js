var margin = {top: 40, right: 40, bottom: 40, left: 40};
var	leftMargin = 100;
var width = 1780 - margin.left - margin.right + leftMargin;
var height = 880 - margin.top - margin.bottom;
var barMargin = 90;
var middleMargin = 100;
var bottomMargin = 5;
var barHeight = (height-barMargin-middleMargin-bottomMargin)/2;
var logoMargin = 100;

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var maxPoints = new Array();
var numberOfTeams = 20;
var numberOfMatches = 38;
var prevMatchday = 0;
var matchday = 0; //The matchday until which it is visualized
var minSize = 0.5*((width-leftMargin)/numberOfTeams);
var maxSize = ((width-leftMargin)/numberOfTeams);
var svg; //The svg containing the whole visualization
var teamNames;
var teamPoints;
var pointBars;
//var pointsDifference;
var teamLogos;
var goalsScored;
var goalsAgainst;
var matchdayText;
var prevPositions = [];
var pointScale;
var pointAxis;
var pointGrid;
var goalScale;
var goalAxis;
var goalGrid;
var key1112 = "0AlkyeRa60rEydGQ5RmN6ZDJvVm13eFUtVlVkXzBBclE";
var key1213 = "0AlkyeRa60rEydG5QV1dJOXRva0pmZUFyT09wbjVqQ2c";
var datakey = key1112;


d3.select("body").attr("background", "Images/background.jpg");

svg = d3.select("#content")
		.append("svg:svg")
		.attr("width", width)
		.attr("height",height);


$(function() {
  $("#dayslider").slider({
	  orientation: "horizontal",
      range: "min",
      step: 1,
      value: 0,
      min: 0,
      max: 38,
      slide: refreshSlider,
      change: refreshSlider
  });
});

function refreshSlider(){
	console.log("Value: " + $("#dayslider").slider("value"));
	matchday =  $("#dayslider").slider("value");
	console.log("Slided");
	newMatchDay();    
}

//Is called when button "plus" is clicked
function buttonPlus(){
	if(matchday < 38){
		prevMatchday = matchday;
		matchday++;    		
	}
	$( "#dayslider" ).slider( "option", "value", matchday );
	console.log("Pressed +");
	newMatchDay();
}

//Is called when button "minus is clicked
function buttonMinus(){
	if(matchday > 0){
		prevMatchday = matchday;
		matchday--;
	}
	$( "#dayslider" ).slider( "option", "value", matchday );
	newMatchDay();
	console.log("Pressed -");
}

start();

function changeSeason(season){	
	teamNames.remove();
	teamPoints.remove();
	pointBars.remove();
//	pointsDifference.remove();
	teamLogos.remove();
	goalsScored.remove();
	goalsAgainst.remove();
	matchdayText.remove();
	pointAxis.remove();
	pointGrid.remove();
	goalAxis.remove();
	goalGrid.remove();
	data = [];
	teamStats = [];
	teamTotalStats = [];
	maxPoints = [];
	if (season == 1112){
		console.log("Season 1112");
		datakey = key1112;
	}
	if (season == 1213){
		console.log("Season 1213");
		datakey = key1213;
	}
	start();
}

//Loads the data from a Google Spreadsheet and calls the visualize function
function start(){
	var ds = new Miso.Dataset({
		importer : Miso.Dataset.Importers.GoogleSpreadsheet,
		parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
		key : datakey,
		worksheet : "1"
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
			visualize(data, ds)
		},
		
		error : function() {
			console.log("Are you sure you are connected to the internet?");
		}
	});
}
	
//The main function
function visualize(data, ds) {
	setTeams(data);
	setteamStats(data);
	console.log(teamStats.length);
	setteamTotalStats();
	console.log(teamTotalStats.length);
	setMaxPoints();
	console.log(maxPoints.length);

	setMatchdayText();

	pointScale = d3.scale.linear()
		.domain([0, d3.max(teamTotalStats, function(d) { return d[1][numberOfMatches][1]; })])
		.range([0, barHeight]);
	goalScale = d3.scale.linear()
		.domain([0, d3.max(teamTotalStats, function(d) { return Math.max(d[1][numberOfMatches][3],d[1][numberOfMatches][5]); })])
		.range([barHeight, 0]);

	pointBars = svg.selectAll("rect.pointbar")
        	.data(teamTotalStats)
        	.enter()
        	.append("rect")
    		.attr("x", function(d, i) {
  	          return leftMargin + (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("y", barMargin)
    		.attr("opacity",0.25)
			.attr("height", 0)
			.attr("width", minSize)
			.on("mouseover", function() {
				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
			})
			.on("mouseout", function() {
				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
			});
	
	function makePointsAxis(){
		return d3.svg.axis()
			.scale(pointScale)
			.orient("left")
			.ticks(8);  //Set rough # of ticks		
	}
	var pointsAxis = makePointsAxis();
	pointAxis = svg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate(50,"+barMargin+")")
		.attr("opacity", 0.9)
		.call(pointsAxis);
	pointGrid = svg.append("g")         
		.attr("transform", "translate(50,"+barMargin+")")
	    .attr("class", "grid")
	    .call(makePointsAxis()
	        .tickSize(-width, 0, 0)
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
		.attr("transform", "translate(50,"+(barMargin+barHeight+middleMargin)+")")
		.attr("opacity", 0.5)
		.call(goalsAxis);
	goalGrid = svg.append("g")         
		.attr("transform", "translate(50,"+(barMargin+barHeight+middleMargin)+")")
	    .attr("class", "grid")
	    .call(makeGoalsAxis()
	        .tickSize(-width, 0, 0)
	        .tickFormat("")
	    );
	
	teamPoints = svg.selectAll("text.points")
			.data(teamTotalStats)
			.enter()
			.append("text")
			.text(function(d) {
				return d[1][matchday][1];
			})
			.attr("y", 85)
			.attr("x", function(d, i) {
				prevPositions.push([d[0], i]);//puts the previous positions in an array
				return leftMargin + (i *maxSize) + maxSize/2;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "14px")
			.attr("fill", "red")
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");

	teamNames = svg.selectAll("text.names")
			.data(teamTotalStats)
			.enter()
			.append("text")
			.text(function(d) {
				return d[0];
			})
			.attr("y", 60)
			.attr("x", function(d, i) {
		          return leftMargin + (i *maxSize) + maxSize/2;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
			.attr("fill", "#1F45FC")
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
//			.append("title")
//			.text(function(d) { return "Points: " + d[1][matchday]});
	
//	pointsDifference = svg.selectAll("text.pointsdiff")
//			.data(teamTotalStats)
//			.enter()
//			.append("text")
//			.attr("y", 195)
//			.attr("font-family", "sans-serif")
//			.attr("font-size", "13px")
//			.attr("fill", "#1F45FC")
//			.attr("font-weight", "bold")
//			.attr("text-anchor", "middle");
	
	teamLogos = svg.selectAll("image.logo")
			.data(teamTotalStats)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {return getImage(d);})
			.attr("height", minSize)
			.attr("width", minSize)
			.attr("y", 100)
			.attr("x", function(d, i) {
			      return leftMargin + (i *maxSize);
			});
	
	goalsScored = svg.selectAll("rect.goalsscored")
			.data(teamTotalStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
  	          	return leftMargin + (i * maxSize) + maxSize/2 - minSize/2;
    		})
//    		.attr("y", function(d){
//    			return height - d[1][matchday][3]*3;
//    		})
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
	goalsAgainst = svg.selectAll("rect.goalsagainst")
			.data(teamTotalStats)
			.enter()
			.append("rect")
			.attr("x", function(d, i) {
		        	return leftMargin + (i * maxSize) + maxSize/2;
			})
//			.attr("y", function(d){
//				return height - d[1][matchday][5]*3;
//			})
			.attr("opacity",0.4)
			.attr("height", 0)
			.attr("width", minSize/2)
			.attr("fill", "#FF0000");
//			.on("mouseover", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
//			})
//			.on("mouseout", function() {
//				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
//			});
	
	drawLines();
	addText();
		
	
	
	newMatchDay();
}


function newMatchDay(){
	if(matchday<39){
		matchdayText.remove();
		setMatchdayText();
		prevPositions = [];
		sortData();
		teamLogos.transition()           
			.duration(1000)
			.attr("height", function(d) { 
				if(maxPoints[matchday] == 0){
					return minSize
				}
				else{
					return minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
				}
			})
			.attr("width", function(d) { 
				if(maxPoints[matchday] == 0){
					return minSize
				}
				else{
					return minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
				}
			})
			.attr("x", function(d, i) {
				prevPositions.push([d[0], i]);
				var width;
				if(maxPoints[matchday] == 0){
					width = minSize;
				}
				else{
					width = minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
				}
				return leftMargin + (i * maxSize) + (maxSize/2) - width/2;
			});
		teamNames.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          return leftMargin + (i * maxSize) + maxSize/2;
			});
		teamPoints.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          return leftMargin + (i * maxSize) + maxSize/2;
			})
			.text(function(d){
				return d[1][matchday][1];
			});
//		pointsDifference.transition()
//			.duration(1000)
//			.attr("x", function(d, i) {
//		          return (i * maxSize) + maxSize/2;
//			})
//			.attr("y", function(d, i) {
//				if(d[1][matchday][1]*5 < 90){
//					return 195;
//				}
//				else{
//					return 105 + d[1][matchday][1]*5;
//				}
//			})
//			.text(function(d){
//				if(matchday == prevMatchday){
//					return "";
//				}
//				var pointDiff = (d[1][matchday][1] - d[1][prevMatchday][1]);
//				console.log(d[0] + " : " + pointDiff);
//				if(pointDiff > 0){
//					return "+" + pointDiff;
//				}
//				else{
//					return "" + pointDiff;					
//				}
//			});
		pointBars.transition()           
			.duration(1000)
    		.attr("x", function(d, i) {
  	          	return leftMargin + (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("height", function(d) {
    			return pointScale(d[1][matchday][1]);
    		});
//    		.text(function(d) { 
//    			console.log(d[0] + ": " + d[1][matchday][1]);
//    			return "Points: " + d[1][matchday][1]
//    			});
		goalsScored.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          	return leftMargin + (i * maxSize) + maxSize/2 - minSize/2;
			})
			.attr("y", function(d){
				return height - (barHeight - goalScale(d[1][matchday][3])) - bottomMargin;
			})
			.attr("height", function(d) {
				return barHeight - goalScale(d[1][matchday][3]);
			});
		goalsAgainst.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          	return leftMargin + (i * maxSize) + maxSize/2;
			})
			.attr("y", function(d){
				return height - (barHeight - goalScale(d[1][matchday][5])) - bottomMargin;
			})
			.attr("height", function(d) {
				return barHeight - goalScale(d[1][matchday][5]);
			});
		console.log("Matchday: " + matchday);
	}
}

function drawLines(){
	svg.append("line")
		.attr("x1" , leftMargin + maxSize*3)
		.attr("y1" , 0)
		.attr("x2" , leftMargin + maxSize*3)
		.attr("y2" , height)
		.attr("stroke", "red")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , leftMargin + maxSize*13)
		.attr("y1" , 0)
		.attr("x2" , leftMargin + maxSize*13)
		.attr("y2" , height)
		.attr("stroke", "red")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , leftMargin + maxSize*16)
		.attr("y1" , 0)
		.attr("x2" , leftMargin + maxSize*16)
		.attr("y2" , height)
		.attr("stroke", "red")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
}

function addText(){
	svg.append("text")
		.text("RELEGATION")
		.attr("x", leftMargin + maxSize*1.5)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("SAFE")
		.attr("x", leftMargin + maxSize*8)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA EUROPE LEAGUE")
		.attr("x", leftMargin + maxSize*14.5)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA CHAMPIONS LEAGUE")
		.attr("x", leftMargin + maxSize*18)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
}

function setMatchdayText(){
	matchdayText = svg.append("text")
		.text("Matchday: " + matchday)
		.attr("x", leftMargin + 750)
		.attr("y", 450)
		.attr("font-family", "sans-serif")
		.attr("font-size", "40px")
		.attr("fill", "red")
		.attr("opacity", 0.5)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
		
}

function returnTenMatches(matchday, data){
	var tenMatches = [];
	for (var i =0; i < data.length; i++){
		if(data[i]["Matchday"] == matchday){
			tenMatches.push(data[i]);
		}
	}
	return tenMatches;
}

function setTeams(data){
	var matches = returnTenMatches(1, data);
	for (var i =0; i < matches.length; i++){
		teamStats.push([matches[i]["HomeTeam"], new Array(38)]);
		teamStats.push([matches[i]["AwayTeam"], new Array(38)]);
		teamTotalStats.push([matches[i]["HomeTeam"], new Array(38)]);
		teamTotalStats.push([matches[i]["AwayTeam"], new Array(38)]);
	}
}

function setteamStats(data){
	for (var i =0; i < data.length; i++){
		if(data[i]["FTR"] == "H"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [3, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [0, data[i]["FTAG"], data[i]["FTHG"]]);
		}
		if(data[i]["FTR"] == "A"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [0, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [3, data[i]["FTAG"], data[i]["FTHG"]]);
		}
		if(data[i]["FTR"] == "D"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [1, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [1, data[i]["FTAG"], data[i]["FTHG"]]);
		}
		
	}
}

function setteamTotalStats(){
	//For every team
	for(var i = 0; i<teamStats.length; i++){
		var teamName = teamStats[i][0];
		giveteamTotalStats(teamName, 0, [0, 0, 0, 0, 0, 0]);
		giveteamTotalStats(teamName, 1, [teamStats[i][1][1][0], teamStats[i][1][1][0], teamStats[i][1][1][1], teamStats[i][1][1][1], teamStats[i][1][1][2], teamStats[i][1][1][2]]);
		//For every matchday
		for(var j = 2; j<teamStats[i][1].length; j++){
			var totPoints = teamTotalStats[i][1][j-1][1] + teamStats[i][1][j][0];
			var totFgoals = teamTotalStats[i][1][j-1][3] + teamStats[i][1][j][1];
			var totAgoals = teamTotalStats[i][1][j-1][5] + teamStats[i][1][j][2];
			giveteamTotalStats(teamName, j, [teamStats[i][1][j][0], totPoints, teamStats[i][1][j][1], totFgoals, teamStats[i][1][j][2], totAgoals])
		}
	}
}
	
function giveteamStats(teamName, matchday, stats){
	for (var i =0; i < teamStats.length; i++){
		if(teamStats[i][0] == teamName){
			teamStats[i][1][matchday] = stats;	
		}
	}
	
}

function giveteamTotalStats(teamName, matchday, stats){
	for (var i =0; i < teamTotalStats.length; i++){
		if(teamTotalStats[i][0] == teamName){
			teamTotalStats[i][1][matchday] = stats;	
		}
	}
}

function setMaxPoints(){
	//For every matchday
	for (var j = 0; j < teamTotalStats[0][1].length; j++){
		maxPoints[j] = teamTotalStats[0][1][j][1];
		//For every team
		for (var i =1; i < teamTotalStats.length; i++){
			if(teamTotalStats[i][1][j][1] > maxPoints[j]){
				maxPoints[j] = teamTotalStats[i][1][j][1];
			}			
		}
	}
}

function getImage(d){
	var club = d[0];
	var result = "Images/notfound.png";
	switch(club){
		case "Arsenal": result = "Images/Arsenal.png"; break; 
		case "Sunderland": result = "Images/Sunderland.png"; break; 
		case "Fulham": result = "Images/Fulham.png"; break; 
		case "Norwich": result = "Images/Norwich.png"; break; 
		case "Newcastle": result = "Images/Newcastle.png"; break; 
		case "Tottenham": result = "Images/Tottenham.png"; break; 
		case "QPR": result = "Images/QPR.png"; break; 
		case "Swansea": result = "Images/Swansea.png"; break; 
		case "Reading": result = "Images/Reading.png"; break; 
		case "Stoke": result = "Images/StokeCity.png"; break; 
		case "West Brom": result = "Images/WestBromwich.png"; break; 
		case "Liverpool": result = "Images/Liverpool.png"; break; 
		case "West Ham": result = "Images/WestHam.png"; break; 
		case "Aston Villa": result = "Images/AstonVilla.png"; break; 
		case "Man City": result = "Images/ManchesterCity.png"; break; 
		case "Southampton": result = "Images/Southampton.png"; break; 
		case "Wigan": result = "Images/Wigan.png"; break; 
		case "Chelsea": result = "Images/Chelsea.png"; break; 
		case "Man United": result = "Images/ManchesterUnited.png"; break; 
		case "Everton": result = "Images/Everton.png"; break; 
		case "Wolves": result = "Images/Wolves.png"; break; 
		case "Blackburn": result = "Images/BlackburnRovers.png"; break; 
		case "Bolton": result = "Images/Bolton.png"; break; 
	}	
	return result;
}

function compareData(data1,data2){
    if (data1[1][matchday][1] > data2[1][matchday][1]) return 1;
    if (data1[1][matchday][1] == data2[1][matchday][1]){
    	if((data1[1][matchday][3] - data1[1][matchday][5]) > (data2[1][matchday][3] - data2[1][matchday][5])){
    		return 1;
    	}
    	else if((data1[1][matchday][3] - data1[1][matchday][5]) < (data2[1][matchday][3] - data2[1][matchday][5])){
    		return -1
    	}
    	else{
    		return 0;    		
    	}
    }
    return -1;
}

function sortData(){
    teamLogos.sort(compareData).order();
    teamNames.sort(compareData).order();
    teamPoints.sort(compareData).order();
    pointBars.sort(compareData).order();
//    pointsDifference.sort(compareData).order();
    goalsScored.sort(compareData).order();
    goalsAgainst.sort(compareData).order();
}