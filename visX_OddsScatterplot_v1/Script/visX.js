var svgmargin = 80;
var menuwidth = 200;
var	leftMargin = 100;
var svgwidth = screen.width - svgmargin - menuwidth;
console.log("Width: " + svgwidth);
var buttonheight = 160;
var svgheight = screen.height - svgmargin - buttonheight;
console.log("Height: " + svgheight);
var leftPadding = 75;
var topPadding = 75;
var rightPadding = 500;
var bottomPadding = 200;
var logoSize = 40;
//var graphwidth = width - leftPadding - rightPadding;
//var graphheight = height - topPadding - bottomPadding;
var matchday = 0;
var playing = 0;
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

var visualizedResult = 7;

var xScale;
var yScale;
var xAxis;
var xGrid;
var yAxis;
var yGrid;

var teamlogos = [];
var matchdayText;
var matchText;
var matchText2;
var selectedLogo;

var navLinks = [];

d3.select("body").attr("background", "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/background.jpg");

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
	      step: 1,
	      value: 0,
	      min: 0,
	      max: 38,
	      slide: refreshSlider,
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
		chosenTeams= [];
		chosenTeams.push(team);
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
//	selectedLogo.attr("opacity", function(d, j) {
//						if(j != chosenTeam) return 0;//bepaalt welk team
//						else return 1; 
//					});
	selectedLogo.attr("opacity", function(d) {
						if(d[0] != chosenTeams[0]) return 0;
//						if(!contains(chosenTeams, d[0])) return 0
//						if(d[0] != chosenTeam) return 0;//bepaalt welk team
						else return 1; 
					});
	moveLogos();
}


function refreshSlider(){
	console.log("Value: " + $("#dayslider").slider("value"));
	if(!buttonPushed){
		matchday =  $("#dayslider").slider("value");
	}
	buttonPushed = 0;
	console.log("Slided");
	moveLogos();    
}

$(function() {
    $( "input[type=submit]" )
      .button();
  });

$(function() {
    $( "#radio1" ).buttonset();
  });

$(function() {
    $( "#radio2" ).buttonset();
  });

function play(){
	if(!playing){
		playing = 1;
		$("#playpause").prop('value', 'Pause');
		buttonPlus();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');
	}
}

function buttonPlus(){
	if(matchday < 38){
		matchday++;    		
		buttonPushed = 1;
		$( "#dayslider" ).slider( "option", "value", matchday );
		if(playing){
			window.setTimeout(buttonPlus,1000);
		}
		else{
			playing = 0;
			$("#playpause").prop('value', 'Play');		
		}
	}
	console.log("Pressed +");
}

//Is called when button "minus is clicked
function buttonMinus(){
	if(matchday > 0){
		matchday--;
		buttonPushed = 1;
		$( "#dayslider" ).slider( "option", "value", matchday );
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
//	console.log("Number of teamTotalStats entries: " + teamTotalStats.length);
	usedTeamStats = teamTotalStats[usedSeason][1];
	loadMatches(data);
//	console.log("Number of matches: " + matchData[0][1][0].length);
//	var match = findMatch("2011-2012", 10, "Arsenal");
//	console.log(match.HomeTeam + " vs " + match.AwayTeam);
	
}

	
//The main function
function visualize() {
	//Scatterplot (nummer 3)
	xScale = d3.scale.linear()
		.domain([0, d3.max(usedTeamStats, function(d) { return d[1][numberOfMatches][1]; })])
		.range([leftPadding, svgwidth - rightPadding]);
	
	var minOdds = d3.min(usedTeamStats, function(d) { return d[1][numberOfMatches][visualizedResult][0]; });
	var maxOdds = d3.max(usedTeamStats, function(d) { return d[1][numberOfMatches][visualizedResult][0]; });
	var yMarge = 10;

	yScale = d3.scale.linear()
		.domain([minOdds - numberOfMatches - yMarge, maxOdds - numberOfMatches + yMarge])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(10);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
	xAxis = svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (svgheight - bottomPadding) + ")")
			.call(x_Axis);
	xGrid = svg.append("g")         
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
	yAxis = svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + leftPadding + "," + 0 +")")
			.call(y_Axis);
	yGrid = svg.append("g")         
			.attr("transform", "translate(" + leftPadding + "," + 0 +")")
		    .attr("class", "grid")
		    .call(makeYAxis()
			    .tickSize(-svgwidth + rightPadding + leftPadding, 0, 0)
			    .tickFormat("")
		    );
	
	matchdayText = svg.selectAll("text.matchday")
			.data(usedTeamStats)
			.enter()
			.append("text")
			.attr("x", svgwidth - rightPadding/2 - 50)
			.attr("y", svgheight/2-100)
			.attr("font-family", "sans-serif")
			.attr("font-size", "26px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("text-anchor", "middle");
			
	matchText = svg.selectAll("text.match")
			.data(usedTeamStats)
			.enter()
			.append("text")
			.attr("x", svgwidth - rightPadding/2 - 50)
			.attr("y", svgheight/2-50)
			.attr("font-family", "sans-serif")
			.attr("font-size", "30px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	matchText2 = svg.selectAll("text.match2")
			.data(usedTeamStats)
			.enter()
			.append("text")
			.attr("x", svgwidth - rightPadding/2 -50)
			.attr("y", svgheight/2)
			.attr("font-family", "sans-serif")
			.attr("font-size", "22px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	selectedLogo = svg.selectAll("image.selectedlogo")
			.data(usedTeamStats)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {return getImage(d);})
			.attr("opacity", function(d, j) {
				if(!contains(chosenTeams,d[0])) return 0;//bepaalt welk team
				else return 1; 
			})
			.attr("x", svgwidth - rightPadding/2 - 100)
			.attr("y", svgheight/2 - 250)
			.attr("height", 100)
			.attr("width", 100);
			
	
	svg.append("text")
			.text("profit")
			.attr("x", leftPadding)
			.attr("y", topPadding - 20)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
	textsvg.append("text")
			.text("Place your bets!")
			.attr("x", 100)
			.attr("y", 65)
			.attr("font-family", "sans-serif")
			.attr("font-size", "60px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold");
	
	textsvg.append("text")
			.text("Choose a team and a result, bet every week and see your profit grow/shrink.")
			.attr("x", 600)
			.attr("y", 65)
			.attr("font-family", "sans-serif")
			.attr("font-size", "30px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75);
	
	svg.append("text")
			.text("#points")
			.attr("x", svgwidth - rightPadding - 30)
			.attr("y", svgheight - bottomPadding - 20)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
//	svg.append("foreignObject")
//			.attr({width: 300, height: 300})
//			.attr("x", svgwidth - rightPadding + 20)
//			.attr("y", svgheight/2 - 100)
//			.append("xhtml:body")
//			.append("xhtml:div")
//			.style({width: 300, 
//		        height: 400, 
//		        "font-size": "20px", 
//		        "background-color": "white"
//		    })
//		    .html("“I can't believe I've been passed over for Long John Silver,” said Mr. Molesley. The lawn introduced the doctor. A poor man made sport of Highclere Castle. “Well we could always start with Mrs Crawley and Lady Grantham,” informed Mrs. Levinson. “Not worse than a maid serving a duke,” argued Mr. Mason.");

//	teamlogos = svg.selectAll("image.logo")
//		.data(usedTeamStats)
//		.enter()
//		.append("image")
//		.attr("xlink:href", function(d) {return getImage(d);})
//		.attr("height", logoSize)
//		.attr("width", logoSize);
	
	for (var i = 0; i<=numberOfMatches; i++){
		var logostring = "image.logo" + i;
		var logos = svg.selectAll(logostring)
			.data(usedTeamStats)
			.enter()
			.append("image")
			.attr("xlink:href", function(d) {return getImage(d);})
			.attr("height", logoSize)
			.attr("width", logoSize)
			.attr("opacity", function(d, j) {
				if(contains(chosenTeams, "All")){
					if(i == matchday) return 1;
					else return 0;					
				}
				if(!contains(chosenTeams, usedTeamStats[j][0])) return 0;//bepaalt welk team
				if(i > matchday) return 0;
				if(i == matchday) return 1;
				if(i < matchday) return 0.2 + Math.pow(0.7,matchday-i)
			})
			.attr("x", function(d) {
				return xScale(d[1][i][1]) - logoSize/2;
			})
			.attr("y", function(d) {
				return yScale(d[1][i][visualizedResult][0] - i) - logoSize/2;
			});
		teamlogos.push(logos);
	}
	
	moveLogos();
}

function moveLogos(){

	for (var i = 0; i<=numberOfMatches; i++){
		teamlogos[i].transition()
				.duration(1000)
				.attr("opacity", function(d, j) {
					if(contains(chosenTeams, "All")){
						if(i == matchday) return 1;
						else return 0;					
					}
					if(!contains(chosenTeams, usedTeamStats[j][0])) return 0;//bepaalt welk team
					if(i > matchday) return 0;
					if(i == matchday) return 1;
					if(i < matchday) return 0.2 + Math.pow(0.7,matchday-i)	
				});
	}
	
	matchdayText.text(function(d, j) {
			return "Matchday: " + matchday;
		});
		
	matchText.text(function(d, j) {
			if(!contains(chosenTeams, usedTeamStats[j][0])) return "";
			if(usedSeason == 0){
				var match = findMatch("2011-2012", matchday, d[0]);				
			}
			if(usedSeason == 1){
				var match = findMatch("2012-2013", matchday, d[0]);				
			}
			if(match == 0) return "";
			var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
			console.log(text);
			return text;
		});
	
	matchText2.text(function(d, j) {
			if(!contains(chosenTeams, usedTeamStats[j][0])) return "";
			if(usedSeason == 0){
				var match = findMatch("2011-2012", matchday, d[0]);				
			}
			if(usedSeason == 1){
				var match = findMatch("2012-2013", matchday, d[0]);				
			}
			if(match == 0) return "";
			var text = "Odds: " + match.OddsH + " - " + match.OddsD + " - " + match.OddsA; 
			console.log(text);
			return text;
		});
	
//	teamlogos.transition()           
//		.duration(1000)
//		.attr("x", function(d) {
//			return xScale(d[1][matchday][1]) - logoSize/2;
//		})
//		.attr("y", function(d) {
//			return yScale(d[1][matchday][visualizedResult][0] - matchday) - logoSize/2;
//		});
}

function changeData(result){
	visualizedResult = result;
	for(var i = 0; i < teamlogos.length; i++){
		teamlogos[i].remove();		
	}
	teamlogos = [];
	xAxis.remove();
	yAxis.remove();
	xGrid.remove();
	yGrid.remove();
	matchdayText.remove();
	matchText.remove();
	matchText2.remove();
	selectedLogo.remove();
	
	visualize();
}

function changeSeason(seasonNumber){
	usedSeason = seasonNumber;
	usedTeamStats = teamTotalStats[usedSeason][1];
	for(var i = 0; i < teamlogos.length; i++){
		teamlogos[i].remove();		
	}
	teamlogos = [];
	xAxis.remove();
	yAxis.remove();
	xGrid.remove();
	yGrid.remove();
	matchdayText.remove();
	matchText.remove();
	matchText2.remove();
	selectedLogo.remove();
	var myNode = document.getElementById("menu");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	loadMenu();
	
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









