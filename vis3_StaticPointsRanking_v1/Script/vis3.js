var svgmargin = 80;
var menuwidth = 200;
var svgwidth = screen.width - svgmargin - menuwidth;
console.log("Width: " + svgwidth);
var buttonheight = 160;
var svgheight = screen.height - svgmargin - buttonheight;
console.log("Height: " + svgheight);
var leftPadding = 50;
var topPadding = 50;
var rightPadding = 200;
var bottomPadding = 200;
var logoSize = 40;
//var graphwidth = width - leftPadding - rightPadding;
//var graphheight = height - topPadding - bottomPadding;
var buttonPushed = 0;
var chosenTeams = [];

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var matchData = [];
var usedTeamStats;
var usedSeason = 0;
var numberOfTeams;
var numberOfMatches;
var seasons = [];
var svg; //The svg containing the whole visualization
var textsvg;

var leftMatchday = 0;
var rightMatchday;

var psuedosvg;
var xScale;
var yScale;
var xAxis;
var xGrid;
var yAxis;
var yGrid;

var positionMatchday = 0;
var positions = [];

var graphLines = [];
var graphPoints = [];
//var matchText;

var navLinks = [];

d3.select("body").attr("background", "Images/background.jpg");

svg = d3.select("#content")
		.append("svg:svg")
		.attr("width", svgwidth)
		.attr("height",svgheight);

textsvg = d3.select("#textsvg")
		.append("svg:svg")
		.attr("width", screen.width-svgmargin)
		.attr("height", 80);

$(function() {
	  $("#dayslider").slider({
		  orientation: "horizontal",
	      range: "min",
		  range: true,
	      step: 1,
	      values: [0,38],
	      min: 0,
	      max: 38,
//	      slide: refreshSlider,
	      change: refreshSlider
	  });
});


//$(function() {
//	$( "#menu" ).menu();
//});

function loadMenu(){

	navLinks = [];
    // All items we'd like to add
    var navItems = [];
    for (var i = 0; i < usedTeamStats.length; i++){
    	navItems.push({href: '#', text: usedTeamStats[i][0], id: usedTeamStats[i][0]});
    	console.log(usedTeamStats[i][0]);
    }
    navItems.push({href: '#', text: "All", id: "All"});
    var navItem, navLink;
    
    var navList = document.getElementById("menu");
    
    // Cycle over each nav item
    for (var i = 0; i < navItems.length; i++) {
        // Create a fresh list item, and anchor
        navItem = document.createElement("li");
        navLink = document.createElement("a");
        
        // Set properties on anchor
        navLink.href = navItems[i].href;
        navLink.id = navItems[i].id;
        navLink.onclick = function(){
        	selectTeam(this.id);
        	navLink 
        	return false;
        };
        navLink.innerHTML = navItems[i].text;
        if(contains(chosenTeams, navItems[i].text)){
        	navLink.style.color = "blue";
        	navLink.style.opacity = 1;
        }
        else{
        	navLink.style.color = "#CC0000";
        	navLink.style.opacity = 0.75        	
        }
        
        navLinks.push(navLink);
        
        // Add anchor to list item, and list item to list
        navItem.appendChild(navLink);
        navList.appendChild(navItem);
    }
};

function selectTeam(team){
	console.log("Selected " + team);
	if(team == "All"){
		if(contains(chosenTeams, "All")){
			chosenTeams = [];
		}
		else{
			chosenTeams= [];
			chosenTeams.push(team);			
		}
	}
	else{
		if(contains(chosenTeams, "All")) deleteValue(chosenTeams, "All");
		if(!contains(chosenTeams, team)) {
			chosenTeams.push(team);
		}
		else{
			deleteValue(chosenTeams, team);
		}		
	}
	
	for(var i = 0; i < navLinks.length; i++){
		if(contains(chosenTeams, navLinks[i].innerHTML)){
			navLinks[i].style.color = "blue";
			navLinks[i].style.opacity = 1;
		}
		else{
			navLinks[i].style.color = "#CC0000";
			navLinks[i].style.opacity = 0.75;
		}
	}
	newMatchdays();
}

function refreshSlider(){
	console.log("Value: " + $("#dayslider").slider("value"));
	if(!buttonPushed){
		leftMatchday = $("#dayslider").slider("values", 0);
		rightMatchday =  $("#dayslider").slider("values", 1);
	}
	buttonPushed = 0;
	console.log("Slided");
	newMatchdays();
}

$(function() {
    $( "input[type=submit]" )
      .button();
  });

$(function() {
    $( "#radio" ).buttonset();
  });

//Is called when button "plus" is clicked
function button1Plus(){
	if(leftMatchday < rightMatchday){
		leftMatchday++;
		buttonPushed = 1;
		$( "#dayslider" ).slider("values", 0, leftMatchday );
	}
	console.log("Pressed +");
}

//Is called when button "minus is clicked
function button1Minus(){
	if(leftMatchday > 0){
		leftMatchday--;
		buttonPushed = 1;
		$( "#dayslider" ).slider("values", 0, leftMatchday );
	}
	console.log("Pressed -");
}

//Is called when button "plus" is clicked
function button2Plus(){
	if(rightMatchday < 38){
		rightMatchday++;    		
		buttonPushed = 1;
		$( "#dayslider" ).slider("values", 1, rightMatchday );
	}
	console.log("Pressed +");
}

//Is called when button "minus is clicked
function button2Minus(){
	if(rightMatchday > leftMatchday){
		rightMatchday--;
		buttonPushed = 1;
		$( "#dayslider" ).slider("values", 1, rightMatchday );
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
			load(data, ds)
		},
		
		error : function() {
			console.log("Are you sure you are connected to the internet?");
		}
	});
}

function load(data, ds){
	loadData(data);
	loadMenu();
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
	usedTeamStats = teamTotalStats[usedSeason][1];
	loadMatches(data);
	setPositions();
	
}

	
//The main function
function visualize() {
	//Scatterplot (nummer 3)	
	psuedosvg = svg.append("svg:g");
	
	xScale = d3.scale.linear()
		.domain([leftMatchday, rightMatchday])
		.range([leftPadding, svgwidth - rightPadding]);

	yScale = d3.scale.linear()
		.domain([d3.min(usedTeamStats, function(d) { return d[1][leftMatchday][1]; }), d3.max(usedTeamStats, function(d) { return d[1][rightMatchday][1]; })])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(10);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
	xAxis = psuedosvg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (svgheight - bottomPadding) + ")")
			.call(x_Axis);
	xGrid = psuedosvg.append("g")         
			.attr("transform", "translate(0," + (svgheight - bottomPadding) + ")")
		    .attr("class", "grid")
		    .call(makeXAxis()
		        .tickSize(-svgheight + topPadding + bottomPadding, 0, 0)
		        .tickFormat("")
		    );

	function makeYAxis(){
		return d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(5);
	}
	var y_Axis = makeYAxis();
	yAxis = psuedosvg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + leftPadding + "," + 0 +")")
			.call(y_Axis);
	yGrid = psuedosvg.append("g")         
			.attr("transform", "translate(" + leftPadding + "," + 0 +")")
		    .attr("class", "grid")
		    .call(makeYAxis()
			    .tickSize(-svgwidth + rightPadding + leftPadding, 0, 0)
			    .tickFormat("")
		    );
		
	psuedosvg.append("text")
			.text("#points")
			.attr("x", leftPadding)
			.attr("y", topPadding - 20)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	textsvg.append("text")
			.text("The evolution of a Premier League season")
			.attr("x", 100)
			.attr("y", 65)
			.attr("font-family", "sans-serif")
			.attr("font-size", "50px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold");
	
	psuedosvg.append("text")
			.text("matchday")
			.attr("x", svgwidth - rightPadding - 30)
			.attr("y", svgheight - bottomPadding + 40)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
//	matchText = psuedosvg.selectAll("text.match")
//			.data(usedTeamStats)
//			.enter()
//			.append("text")
//			.attr("x", leftPadding + 300)
//			.attr("y", topPadding + 100)
//			.attr("font-family", "sans-serif")
//			.attr("font-size", "30px")
//			.attr("fill", "#CC0000")
//			.attr("opacity", 0.75)
//			.attr("font-weight", "bold")
//			.attr("text-anchor", "middle");

	var line = d3.svg.line()
		.x(function(d,i) { 
			return xScale(leftMatchday + i); 
		})
		.y(function(d) { 
			return yScale(d); 
		});
	
	var cl = []
	for(var i = leftMatchday; i <= rightMatchday; i++){
		cl.push(getPositionPoints(i, 4));
	}
	
	psuedosvg.append("svg:path")
		.attr("class", "line")
		.attr("d", line(cl))
		.attr("opacity", 0.75)
		.attr("stroke", "#CC0000")
		.attr("stroke-width", 3)
		.append("svg:title")
		.text("Champions League");	
	
	var el = []
	for(var i = leftMatchday; i <= rightMatchday; i++){
		el.push(getPositionPoints(i, 7));
	}
	
	psuedosvg.append("svg:path")
		.attr("class", "line")
		.attr("d", line(el))
		.attr("opacity", 0.75)
		.attr("stroke", "#CC0000")
		.attr("stroke-width", 3)
		.append("svg:title")
		.text("Europe League");	
	
	var relegation = []
	for(var i = leftMatchday; i <= rightMatchday; i++){
		relegation.push(getPositionPoints(i, 17));
	}
	
	psuedosvg.append("svg:path")
		.attr("class", "line")
		.attr("d", line(relegation))
		.attr("opacity", 0.75)
		.attr("stroke", "#CC0000")
		.attr("stroke-width", 3)
		.append("svg:title")
		.text("Relegation");
	
	psuedosvg.append("text")
		.text("Champions League")
		.attr("x", xScale(rightMatchday) + 20)
		.attr("y", yScale(cl[cl.length-1]) - 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	psuedosvg.append("text")
		.text("Europe League")
		.attr("x", xScale(rightMatchday) + 20)
		.attr("y", (yScale(el[el.length-1])+yScale(cl[cl.length-1]))/2)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	psuedosvg.append("text")
		.text("Safe")
		.attr("x", xScale(rightMatchday) + 20)
		.attr("y", (yScale(el[el.length-1])+yScale(relegation[relegation.length-1]))/2)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	psuedosvg.append("text")
		.text("Relegation")
		.attr("x", xScale(rightMatchday) + 20)
		.attr("y", yScale(relegation[relegation.length-1]) + 30)
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
		.attr("fill", "#CC0000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	var dataset = [];
	for(var j = 0; j < numberOfTeams; j++){
		var temp = []
		for(var i = leftMatchday; i <= rightMatchday; i++){
			temp.push(usedTeamStats[j][1][i][1]);
		}
		dataset.push(temp);		
	}
		
	for(var i = 0; i < dataset.length; i++){
		var opacity = 0.25;
		var factor = 1;
		if(contains(chosenTeams, usedTeamStats[i][0])){
			opacity = 1;
			factor = 2;
		}
		if(contains(chosenTeams, "All")){
			opacity = 1;
			factor = 1;
		}
		var graphLine = psuedosvg.append("svg:path")
			.attr("class", "line")
			.attr("d", line(dataset[i]))
			.attr("id", usedTeamStats[i][0])
			.attr("opacity", opacity)
			.attr("stroke","steelblue")
			.attr("stroke-width", 2*factor)
	        .on("mouseover", function(){d3.select(this).style("opacity", 1);})
	        .on("mouseout", function(){
	        	if(contains(chosenTeams, d3.select(this).attr("id"))){
	        		d3.select(this).style("opacity", 1);
	        	}
	        	else{
	        		d3.select(this).style("opacity", opacity);
	        	}
	        })
	        .on("click", function(){
	        	console.log("testing");
	        	if(contains(chosenTeams, "All")){
	        		deleteValue(chosenTeams, "All");
	        		chosenTeams.push(d3.select(this).attr("id"));
	        	}
	        	else if(contains(chosenTeams, d3.select(this).attr("id"))){
	        		deleteValue(chosenTeams, d3.select(this).attr("id"));
	        	}
	        	else{
	        		chosenTeams.push(d3.select(this).attr("id"));
	        	}
	        	newMatchdays();
	        })
			.append("svg:title")
			.text(usedTeamStats[i][0]);		
		graphLines.push(graphLine);
	}
		
//	var div = d3.select("#content").append("div")   
//	    .attr("class", "tooltip")               
//	    .style("opacity", 0);

	for(var j = 0; j < numberOfTeams; j++){
		for(var i = leftMatchday; i <= rightMatchday; i++){
			var match = 0;
			if(usedSeason == 0){
				match = findMatch("2011-2012", i, usedTeamStats[j][0]);	
			}
			if(usedSeason == 1){
				match = findMatch("2012-2013", i, usedTeamStats[j][0]);	
			}
			var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
			var team = usedTeamStats[j][0];
			var opacity = 0.15;
			var factor = 1;
			if(contains(chosenTeams, team)){
				opacity = 1;
				factor = 1.5;
			}
			if(contains(chosenTeams, "All")){
				opacity = 1;
				factor = 1;
			}
//			if(i == rightMatchday){
//				opacity = 1;
//			}
			console.log(team + " : " + opacity);
			var graphPoint = psuedosvg.append("image")
					.attr("xlink:href", getImage(usedTeamStats[j]))
					.attr("id", usedTeamStats[j][0])
					.attr("height", 20*factor)
					.attr("width", 20*factor)
					.attr("opacity",opacity)
//					.on("mouseover", function(){return tooltip.style("visibility", "visible");})
//					.on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
//					.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
					.on("mouseover", function(d) { 
						d3.select(this).style("opacity", 1);
//			            div.transition()        
//			                .duration(200)      
//			                .style("opacity", .9);      
//			            div .html(text + "<br/>"  + "test")  
//			                .style("left", (d3.event.pageX) + "px")     
//			                .style("top", (d3.event.pageY - div.attr("height")) + "px");    
			        })                  
			        .on("mouseout", function(d) {     
			        	if(contains(chosenTeams, d3.select(this).attr("id"))){
			        		d3.select(this).style("opacity", 1);
			        	}
			        	else{
			        		d3.select(this).style("opacity", opacity);
			        	}  
//			            div.transition()        
//			                .duration(500)      
//			                .style("opacity", 0);   
			        })
			        .on("click", function(){
			        	console.log("testing");
			        	if(contains(chosenTeams, "All")){
			        		deleteValue(chosenTeams, "All");
			        		chosenTeams.push(d3.select(this).attr("id"));
			        	}
			        	else if(contains(chosenTeams, d3.select(this).attr("id"))){
			        		deleteValue(chosenTeams, d3.select(this).attr("id"));
//			        		setMatchdayText(0, d3.select(this).attr("id"));
			        	}
			        	else{
			        		chosenTeams.push(d3.select(this).attr("id"));
//			        		setMatchdayText(5, d3.select(this).attr("id"));
			        	}
			        	newMatchdays();
			        })
//			        .attr("cx", xScale(i))
//			        .attr("cy", yScale(usedTeamStats[j][1][i][1]));
			        .attr("x", xScale(i)-10*factor)
			        .attr("y", yScale(usedTeamStats[j][1][i][1])-10*factor)
					.append("svg:title")
					.text(function(){
						var match = 0;
						if(usedSeason == 0){
							match = findMatch("2011-2012", i, usedTeamStats[j][0]);	
						}
						if(usedSeason == 1){
							match = findMatch("2012-2013", i, usedTeamStats[j][0]);	
						}
						var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
						return text;
					});
			graphPoints.push(graphPoint);
		}
	}
	
//	setMatchdayText(0,"");
	
}

function newMatchdays(){
//	xAxis.remove();
//	xGrid.remove();
//	yAxis.remove();
//	yGrid.remove();
//	for(var i = 0; i < graphPoints.length; i++){
//		graphPoints[i].remove();
//	}
//	for(var i = 0; i < graphLines.length; i++){
//		graphLines[i].remove();
//	}
	for(var i = 0; i < navLinks.length; i++){
		if(contains(chosenTeams, navLinks[i].innerHTML)){
			navLinks[i].style.color = "blue";
			navLinks[i].style.opacity = 1;
		}
		else{
			navLinks[i].style.color = "#CC0000";
			navLinks[i].style.opacity = 0.75;
		}
	}
	psuedosvg.remove();
	graphPoints = [];
	graphLines = [];
	visualize();
}

//function setMatchdayText(matchday, team){
//	matchText.text(function(d) {
//		if(d[0] != team) return "aaaaa";
//		if(matchday == 0) return "aaaaa";
//		if(usedSeason == 0){
//			var match = findMatch("2011-2012", matchday, team);				
//		}
//		if(usedSeason == 1){
//			var match = findMatch("2012-2013", matchday, team);				
//		}
//		if(match == 0) return "";
//		var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
//		console.log(text);
//		return text;
//	});
//}

function changeSeason(seasonNumber){
	usedSeason = seasonNumber;
	usedTeamStats = teamTotalStats[usedSeason][1];
	psuedosvg.remove();
	graphPoints = [];
	graphLines = [];
	var myNode = document.getElementById("menu");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	var oldChosenTeams = chosenTeams.slice();
	for(var i = 0; i < oldChosenTeams.length; i++){
		var stay = 0;
		for(var j = 0; j < usedTeamStats.length; j++){
			if(oldChosenTeams[i] == usedTeamStats[j][0]) stay = 1;
		}
		if(!stay){
			deleteValue(chosenTeams, oldChosenTeams[i]);
		}
	}
	loadMenu();
	setPositions();
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
		rightMatchday = numberOfMatches;
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

//Returns the correct image for the club
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
		case "Bergen": result = "Images/mons.png"; break; 
		case "Oud-Heverlee Leuven": result = "Images/ohl.jpg"; break; 
		case "Club Brugge": result = "Images/club_brugge.png"; break; 
		case "Waasland-Beveren": result = "Images/waasland.png"; break; 
		case "Germinal": result = "Images/beerschot.png"; break; 
		case "Lokeren": result = "Images/lokeren.png"; break; 
		case "Kortrijk": result = "Images/kortrijk.png"; break; 
		case "Anderlecht": result = "Images/anderlecht.png"; break; 
		case "Mechelen": result = "Images/mechelen.png"; break; 
		case "Charleroi": result = "Images/charleroi.png"; break; 
		case "Genk": result = "Images/genk.png"; break; 
		case "Cercle Brugge": result = "Images/cercle.png"; break; 
		case "Gent": result = "Images/aagent.png"; break; 
		case "Lierse": result = "Images/lierse.png"; break; 
		case "Standard": result = "Images/standard.png"; break; 
		case "Waregem": result = "Images/zulte.png"; break; 
	}	
	return result;
}


function contains(array, value){
	result = 0;
	for (var i=0; i < array.length; i++){
		if(array[i] == value) result = 1;
	}
	return result;
}

function deleteValue(array, value){
	var index = array.indexOf(value);
	if (index > -1) {
	    array.splice(index, 1);
	}
}

function compareData(data1,data2){
    if (data1[1][positionMatchday][1] > data2[1][positionMatchday][1]) return 1;
    if (data1[1][positionMatchday][1] == data2[1][positionMatchday][1]){
    	if((data1[1][positionMatchday][3] - data1[1][positionMatchday][5]) > (data2[1][positionMatchday][3] - data2[1][positionMatchday][5])){
    		return 1;
    	}
    	else if((data1[1][positionMatchday][3] - data1[1][positionMatchday][5]) < (data2[1][positionMatchday][3] - data2[1][positionMatchday][5])){
    		return -1
    	}
    	else{
    		return 0;    		
    	}
    }
    return -1;
}

function setPositions(){
	positions = [];
	for(var i = 0; i < numberOfTeams; i++){
		positions.push([usedTeamStats[i][0], new Array(numberOfMatches+1)]);
	}
	var positionLogos = svg.selectAll("circle.pos")
						.data(usedTeamStats)
						.enter()
						.append("circle")
						.attr("opacity", 0);
	
	for(var i = 0; i <= numberOfMatches; i++){
		positionMatchday = i;
		positionLogos.sort(compareData).order();
		positionLogos.attr("r", function(d,j){
			setTeamPosition(d[0],j);
		});
		
	}
}

function setTeamPosition(team, position){
	for(var i = 0; i < positions.length; i++){
		if(positions[i][0] == team){
			positions[i][1][positionMatchday] = numberOfTeams-position;
		}
	}
}

function getPositionPoints(matchday, position){
	for(var i = 0; i < positions.length; i++){
		if(positions[i][1][matchday] == position){
			return usedTeamStats[i][1][matchday][1];
		}
	}
}










