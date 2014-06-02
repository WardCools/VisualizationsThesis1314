var margin = {top: 40, right: 40, bottom: 40, left: 40};
var	leftMargin = 100;
var width = 1780 - margin.left - margin.right + leftMargin;
var height = 880 - margin.top - margin.bottom;
var leftPadding = 100;
var topPadding = 75;
var rightPadding = 500;
var bottomPadding = 75;
var logoSize = 40;
var graphwidth = width - leftPadding - rightPadding;
var graphheight = height - topPadding - bottomPadding;
var matchday = 0;
var playing = 0;
var buttonPushed = 0;

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var numberOfTeams;
var numberOfMatches;
var svg; //The svg containing the whole visualization

var visualizedResult = 7;

var xScale;
var yScale;
var xAxis;
var xGrid;
var yAxis;
var yGrid;

var teamlogos;

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
    $( "#radio" ).buttonset();
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
//		  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Visualisatie3/Data/PL_allseasons_matchday.csv',
		  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Visualisatie3/Data/E0_1112_matchday_hazzled.csv',
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
	loadData();
	visualize();
}
	
//The main function
function visualize() {
	//Scatterplot (nummer 3)
	xScale = d3.scale.linear()
		.domain([0, d3.max(teamTotalStats, function(d) { return d[1][numberOfMatches][1]; })])
		.range([leftPadding, width - rightPadding]);
	
	var minOdds = d3.min(teamTotalStats, function(d) { return d[1][numberOfMatches][visualizedResult][0]; });
	var maxOdds = d3.max(teamTotalStats, function(d) { return d[1][numberOfMatches][visualizedResult][0]; });
	var yMarge = 10;

	yScale = d3.scale.linear()
		.domain([minOdds - numberOfMatches - yMarge, maxOdds - numberOfMatches + yMarge])
		.range([height - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(10);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
	xAxis = svg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (height - bottomPadding) + ")")
			.call(x_Axis);
	xGrid = svg.append("g")         
			.attr("transform", "translate(0," + (height - bottomPadding) + ")")
		    .attr("class", "grid")
		    .call(makeXAxis()
		        .tickSize(-width, 0, 0)
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
			    .tickSize(-width, 0, 0)
			    .tickFormat("")
		    );

	teamlogos = svg.selectAll("image.logo")
		.data(teamTotalStats)
		.enter()
		.append("image")
		.attr("xlink:href", function(d) {return getImage(d);})
		.attr("height", logoSize)
		.attr("width", logoSize);
	
	moveLogos();
}

function moveLogos(){
	
	teamlogos.transition()           
		.duration(1000)
		.attr("x", function(d) {
			return xScale(d[1][matchday][1]) - logoSize/2;
		})
		.attr("y", function(d) {
			return yScale(d[1][matchday][visualizedResult][0] - matchday) - logoSize/2;
		});
}

function changeData(result){
	visualizedResult = result;
	teamlogos.remove();
	xAxis.remove();
	yAxis.remove();
	xGrid.remove();
	yGrid.remove();
	
	visualize();
}

function loadData(){
	setTeams(data);
	setteamStats(data);
	console.log("Number of teamStats entries: " + teamStats.length);
	setteamTotalStats();
	console.log("Number of teamTotalStats entries: " + teamTotalStats.length);
}

//Returns the matches of 1 matchday
function returnOneMatchday(matchday, data){
	var oneMatchday = [];
	for (var i =0; i < data.length; i++){
		if(data[i]["Matchday"] == matchday){
			oneMatchday.push(data[i]);
		}
	}
	return oneMatchday;
}

//Fills in the teams of the teamStats and teamTotalStats variables
function setTeams(data){
	var matches = returnOneMatchday(1, data);
	numberOfTeams = matches.length*2;
	numberOfMatches = (numberOfTeams-1)*2;
	for (var i =0; i < matches.length; i++){
		teamStats.push([matches[i]["HomeTeam"], new Array(numberOfMatches)]);
		teamStats.push([matches[i]["AwayTeam"], new Array(numberOfMatches)]);
		teamTotalStats.push([matches[i]["HomeTeam"], new Array(numberOfMatches)]);
		teamTotalStats.push([matches[i]["AwayTeam"], new Array(numberOfMatches)]);
	}
}

//Fills in the teamStats data
function setteamStats(data){
	for (var i =0; i < data.length; i++){
		if(data[i]["FTR"] == "H"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [3, data[i]["FTHG"], data[i]["FTAG"], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]], [0,0,0,0,0], [0,0,0,0,0]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [0, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]]]);
		}
		if(data[i]["FTR"] == "D"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [1, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [1, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0]]);
		}
		if(data[i]["FTR"] == "A"){
			giveteamStats(data[i]["HomeTeam"], data[i]["Matchday"], [0, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]]]);
			giveteamStats(data[i]["AwayTeam"], data[i]["Matchday"], [3, data[i]["FTAG"], data[i]["FTHG"], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]], [0,0,0,0,0], [0,0,0,0,0]]);
		}
	}
}

//Help function for setteamStats()
function giveteamStats(teamName, matchday, stats){
	for (var i =0; i < teamStats.length; i++){
		if(teamStats[i][0] == teamName){
			teamStats[i][1][matchday] = stats;	
		}
	}
}

//Fills in the teamTotalStats data
function setteamTotalStats(){
	//For every team
	for(var i = 0; i<teamStats.length; i++){
		var teamName = teamStats[i][0];
		giveteamTotalStats(teamName, 0, [0, 0, 0, 0, 0, 0, [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0]]);
		giveteamTotalStats(teamName, 1, [teamStats[i][1][1][0], teamStats[i][1][1][0], teamStats[i][1][1][1], teamStats[i][1][1][1], teamStats[i][1][1][2], teamStats[i][1][1][2], teamStats[i][1][1][3], teamStats[i][1][1][3], teamStats[i][1][1][4], teamStats[i][1][1][4], teamStats[i][1][1][5], teamStats[i][1][1][5]]);
		//For every matchday
		for(var j = 2; j<teamStats[i][1].length; j++){
			var totPoints = teamTotalStats[i][1][j-1][1] + teamStats[i][1][j][0];
			var totFgoals = teamTotalStats[i][1][j-1][3] + teamStats[i][1][j][1];
			var totAgoals = teamTotalStats[i][1][j-1][5] + teamStats[i][1][j][2];
			var totWodds = []
			for (var k = 0; k < teamStats[i][1][j][3].length; k++){
				totWodds.push(teamTotalStats[i][1][j-1][7][k] + teamStats[i][1][j][3][k])
			}
			var totDodds = []
			for (var k = 0; k < teamStats[i][1][j][4].length; k++){
				totDodds.push(teamTotalStats[i][1][j-1][9][k] + teamStats[i][1][j][4][k])
			}
			var totLodds = []
			for (var k = 0; k < teamStats[i][1][j][5].length; k++){
				totLodds.push(teamTotalStats[i][1][j-1][11][k] + teamStats[i][1][j][5][k])
			}
			giveteamTotalStats(teamName, j, [teamStats[i][1][j][0], totPoints, teamStats[i][1][j][1], totFgoals, teamStats[i][1][j][2], totAgoals, teamStats[i][1][j][3], totWodds, teamStats[i][1][j][4], totDodds, teamStats[i][1][j][5], totLodds])
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











