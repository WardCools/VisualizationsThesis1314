var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 1680 - margin.left - margin.right,
    height = 680 - margin.top - margin.bottom;

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var maxPoints = new Array();
var numberOfTeams = 20;
var prevMatchday = 0;
var matchday = 0; //The matchday until which it is visualized
var minSize = 0.5*(width/numberOfTeams);
var maxSize = (width/numberOfTeams);
var svg; //The svg containing the whole visualization
var teamNames;
var teamPoints;
var pointBars;
var pointsDifference;
var teamLogos;

//Is called when button "plus" is clicked
function buttonPlus(){
	if(matchday < 38){
		prevMatchday = matchday;
		matchday++;    		
		
	}
	console.log("Pressed +");
	newMatchDay();
}

//Is called when button "minus is clicked
function buttonMinus(){
	if(matchday > 0){
		prevMatchday = matchday;
		matchday--;
	}
	newMatchDay();
	console.log("Pressed -");
}

//$(document).ready(function() {
//	$("#button+").click(function(){
//		if(matchday < 38){
//			matchday++;    		
//		}
//		console.log("Pressed +");
//		newMatchDay();
//	}); 
//	$("#button-").click(function(){
//		if(matchday > 1){
//			matchday--;
//		}
//		newMatchDay();
//		console.log("Pressed -");
//	}); 
//});

//Controls the slider
DYN_WEB.Event.domReady( function() {
    // args: slider id, track id, axis ('v' or 'h')
    var slider = new DYN_WEB.Slider('slider', 'track', 'h');
    document.getElementById('display').innerHTML = parseInt(1, 10);
    
    // display value when click on track or drag slider
    slider.on_move = function(x, y) {
    	var oldmatchday = matchday;
    	matchday = Math.round((x/164)*38);
    	if(oldmatchday != matchday){
    		document.getElementById('display').innerHTML = parseInt(matchday, 10);
    		console.log("Slided");
    		newMatchDay();    		
    	}
    };
}
);

$( "#dayslider" ).slider();
$( "#dayslider" ).slider( "option", "max", 38 );

//Loads the data from a Google Spreadsheet and calls the visualize function
var ds = new Miso.Dataset({
	  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
	  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
	  key : "0AlkyeRa60rEydG5QV1dJOXRva0pmZUFyT09wbjVqQ2c",
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
	
//The main function
function visualize(data, ds) {
	setTeams(data);
	setteamStats(data);
	setteamTotalStats();
	setMaxPoints();
	console.log(teamStats.length);
	console.log(teamTotalStats.length);
	console.log(maxPoints.length);
	
	d3.select("body").attr("background", "Images/background.jpg");
	
	svg = d3.select("#content")
			.append("svg")
			.attr("width", width)
			.attr("height",height);
	
	teamPoints = svg.selectAll("text.points")
			.data(teamTotalStats)
			.enter()
			.append("text")
			.text(function(d) {
				return d[1][matchday][1];
			})
			.attr("y", 85)
			.attr("x", function(d, i) {
				return (i *maxSize) + maxSize/2;
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
		          return (i *maxSize) + maxSize/2;
			})
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
			.attr("fill", "#1F45FC")
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	pointBars = svg.selectAll("rect.pointbar")
        	.data(teamTotalStats)
        	.enter()
        	.append("rect")
    		.attr("x", function(d, i) {
  	          return (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("y", 90)
    		.attr("opacity",0.2)
			.attr("height", 0)
			.attr("width", minSize)
			.on("mouseover", function() {
				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
			})
			.on("mouseout", function() {
				d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
			});
//			.append("title")
//			.text(function(d) { return "Points: " + d[1][matchday]});
	
	pointsDifference = svg.selectAll("text.pointsdiff")
			.data(teamTotalStats)
			.enter()
			.append("text")
			.attr("y", 195)
			.attr("font-family", "sans-serif")
			.attr("font-size", "13px")
			.attr("fill", "#1F45FC")
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	teamLogos = svg.selectAll("image.logo")
			.data(teamTotalStats)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {return getImage(d);})
			.attr("height", minSize)
			.attr("width", minSize)
			.attr("y", 100)
			.attr("x", function(d, i) {
			      return (i *maxSize);
			});
	
	drawLines();
	addText();
	newMatchDay();
}

function drawLines(){
	svg.append("line")
		.attr("x1" , 240)
		.attr("y1" , 0)
		.attr("x2" , 240)
		.attr("y2" , 400)
		.attr("stroke", "red")
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , 1040)
		.attr("y1" , 0)
		.attr("x2" , 1040)
		.attr("y2" , 400)
		.attr("stroke", "red")
		.attr("stroke-width", 5);
	svg.append("line")
		.attr("x1" , 1280)
		.attr("y1" , 0)
		.attr("x2" , 1280)
		.attr("y2" , 400)
		.attr("stroke", "red")
		.attr("stroke-width", 5);
}

function addText(){
	svg.append("text")
		.text("RELEGATION")
		.attr("x", 120)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("SAFE")
		.attr("x", 640)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA EUROPE LEAGUE")
		.attr("x", 1160)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	svg.append("text")
		.text("UEFA CHAMPIONS LEAGUE")
		.attr("x", 1440)
		.attr("y", 25)
		.attr("font-family", "sans-serif")
		.attr("font-size", "18px")
		.attr("fill", "red")
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
}

function returnTenMatches(matchday, data){
	var tenMatches = [];
	for (var i =0; i < data.length; i++){
		if(data[i]["Speeldag"] == matchday){
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
			giveteamStats(data[i]["HomeTeam"], data[i]["Speeldag"], [3, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Speeldag"], [0, data[i]["FTAG"], data[i]["FTHG"]]);
		}
		if(data[i]["FTR"] == "A"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Speeldag"], [0, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Speeldag"], [3, data[i]["FTAG"], data[i]["FTHG"]]);
		}
		if(data[i]["FTR"] == "D"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Speeldag"], [1, data[i]["FTHG"], data[i]["FTAG"]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Speeldag"], [1, data[i]["FTAG"], data[i]["FTHG"]]);
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
	}	
	return result;
}

function newMatchDay(){
	if(matchday<39){
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
				var width;
				if(maxPoints[matchday] == 0){
					width = minSize;
				}
				else{
					width = minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
				}
				return (i * maxSize) + (maxSize/2) - width/2;
			});
		teamNames.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          return (i * maxSize) + maxSize/2;
			});
		teamPoints.transition()           
			.duration(1000)
			.attr("x", function(d, i) {
		          return (i * maxSize) + maxSize/2;
			})
			.text(function(d){
				return d[1][matchday][1];
			});
		pointsDifference.transition()
			.duration(1000)
			.attr("x", function(d, i) {
		          return (i * maxSize) + maxSize/2;
			})
			.attr("y", function(d, i) {
				if(d[1][matchday][1]*3 < 90){
					return 195;
				}
				else{
					return 105 + d[1][matchday][1]*3;
				}
			})
			.text(function(d){
				if(matchday == prevMatchday){
					return "";
				}
				var pointDiff = (d[1][matchday][1] - d[1][prevMatchday][1]);
				console.log(d[0] + " : " + pointDiff);
				if(pointDiff > 0){
					return "+" + pointDiff;
				}
				else{
					return "" + pointDiff;					
				}
			});
		pointBars.transition()           
			.duration(1000)
    		.attr("x", function(d, i) {
  	          	return (i * maxSize) + maxSize/2 - minSize/2;
    		})
    		.attr("height", function(d) {
    			return d[1][matchday][1]*3;
    		});
//    		.text(function(d) { 
//    			console.log(d[0] + ": " + d[1][matchday][1]);
//    			return "Points: " + d[1][matchday][1]
//    			});
		console.log("Speeldag: " + matchday);
        document.getElementById('display').innerHTML = parseInt(matchday, 10);
	}
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
    pointsDifference.sort(compareData).order();
}