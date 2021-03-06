var svgmargin = 80;
var menuwidth = 200;
var svgwidth = screen.width - svgmargin - menuwidth;
console.log("Width: " + svgwidth);
var buttonheight = 160;
var svgheight = screen.height - svgmargin - buttonheight;
console.log("Height: " + svgheight);
var leftPadding = 75;
var topPadding = 100;
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

var dataset;
var positionDataset;
var div;
var line;

var visualizedResult = 7;

var psuedosvg;
var xScale;
var yScale;
var xAxis;
var xGrid;
var yAxis;
var yGrid;

var positionMatchday = 0;
var positions = [];

var teamlogos;
var graphLines;
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
	usedTeamStats = teamTotalStats[usedSeason][1];
	loadMatches(data);
	setPositions();
	
}

	
//The main function
function visualize() {
	//Scatterplot (nummer 3)
	
	var xmin = 0;
	var xmax = 0;
	
	for(var i = 0; i < numberOfMatches; i ++){
		if(d3.min(usedTeamStats, function(d) { return d[1][i][13]*2.5 + d[1][i][15]; }) < xmin) xmin = d3.min(usedTeamStats, function(d) { return d[1][i][13]*2.5 + d[1][i][15]; });
		if(d3.max(usedTeamStats, function(d) { return d[1][i][13]*2.5 + d[1][i][15]; }) > xmax) xmax = d3.max(usedTeamStats, function(d) { return d[1][i][13]*2.5 + d[1][i][15]; });
	}
	
	xScale = d3.scale.linear()
		.domain([xmin, xmax])
		.range([leftPadding, svgwidth - rightPadding]);

	yScale = d3.scale.linear()
		.domain([numberOfTeams, 1])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(20);  //Set rough # of ticks
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
			.ticks(numberOfTeams);
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
			.attr("opacity", function(d) {
				if(!contains(chosenTeams,d[0])) return 0;//bepaalt welk team
				else return 1; 
			})
//			.attr("opacity", function(d, j) {
//				if(j != chosenTeam) return 0;//bepaalt welk team
//				else return 1; 
//			})
			.attr("x", svgwidth - rightPadding/2 - 100)
			.attr("y", svgheight/2 - 250)
			.attr("height", 100)
			.attr("width", 100);
			
	
	svg.append("text")
			.text("position")
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
	
	svg.append("text")
			.text("cards (red: 2.5 points, yellow 1 point)")
			.attr("x", svgwidth - rightPadding - 30)
			.attr("y", svgheight - bottomPadding + 40)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	

	line = d3.svg.line()
		.x(function(d) { 
			return xScale(d[1]); 
		})
		.y(function(d) { 
			return yScale(d[0]); 
		});
	
	dataset = [];
	positionsDataset = [];
	for(var j = 0; j < numberOfTeams; j++){
		var temp = []
		for(var i = 0; i <= numberOfMatches; i++){
			temp.push([getPosition(usedTeamStats[j][0], i), (usedTeamStats[j][1][i][3]-usedTeamStats[j][1][i][5])]);
			positionsDataset.push([j, i]);
			dataset.push([j, i, temp]);		
		}
	}
	
	div = d3.select("#content").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);

	teamlogos = svg.selectAll("image.logo")
				.data(positionsDataset)
				.enter()
				.append("image")
				.attr("xlink:href", function(d){
					return getImage(usedTeamStats[d[0]]);
				})
				.attr("height", logoSize)
				.attr("width", logoSize)
		        .attr("x", function(d){
		        	return xScale(usedTeamStats[d[0]][1][d[1]][13]*2.5 - usedTeamStats[d[0]][1][d[1]][15]) - logoSize/2;
		        })
		        .attr("y", function(d){
		        	return yScale(getPosition(usedTeamStats[d[0]][0], d[1])) - logoSize/2;
		        })
//		        .attr("opacity", function(d){
//					if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//						return 1;
//					}
//					if(contains(chosenTeams, "All")){
//						return 1;
//					}
//					return 0.15;
//		        })	
				.on("mouseover", function(d) { 
//					d3.select(this).style("opacity", 1);
		        	if(contains(chosenTeams, usedTeamStats[d[0]][0]) || contains(chosenTeams, "All")){
		        		var match = 0;
		        		if(usedSeason == 0){
		        			match = findMatch("2011-2012", d[1], usedTeamStats[d[0]][0]);	
		        		}
		        		if(usedSeason == 1){
		        			match = findMatch("2012-2013", d[1], usedTeamStats[d[0]][0]);	
		        		}
		        		var postion = getPosition(usedTeamStats[d[0]][0], d[1]);
		        		var points = usedTeamStats[d[0]][1][d[1]][1];
		        		var goalsMade = usedTeamStats[d[0]][1][d[1]][3];
		        		var goalsAgainst = usedTeamStats[d[0]][1][d[1]][5];
		        		var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
		        		div.transition()        
			        		.duration(200)      
			        		.style("opacity", 0.9);      
		        		div .html("<b><big><big>" + usedTeamStats[d[0]][0] + "</big></big></b><br/>" + "<i>Matchday: </i>" + "<b>" + d[1] + "</b><br/><i>Number of points: </i>" + "<b>" + points + "</b><br/>" + "<i>Goals made: </i>" + "<b>" + goalsMade + "</b><br/>" + "<i>Goals against: </i>" + "<b>" + goalsAgainst + "</b><br/>" + "<small><i>Last match: </i></small>" + "<br/>" + "   " + "<big><b>" + text + "</big></b>")  
			        		.style("left", (d3.event.pageX) + "px")     
//			        		.style("top", (d3.event.pageY - div.attr("height")) + "px");
		        			.style("top", (d3.event.pageY - 125) + "px");				        		
		        	}
				})                  
		        .on("mouseout", function(d) { 
//		        	if(contains(chosenTeams, "All")){
//		        		d3.select(this).style("opacity", 1);
//					}    
//		        	else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//		        		d3.select(this).style("opacity", 1);
//		        	}
//		        	else{
//		        		d3.select(this).style("opacity", 0.15);
//		        	}
		            div.transition()        
		                .duration(500)      
		                .style("opacity", 0);   
		        })
		        .on("click", function(d){
		        	console.log("testing");
		        	if(contains(chosenTeams, "All")){
		        		deleteValue(chosenTeams, "All");
		        		chosenTeams.push(usedTeamStats[d[0]][0]);
		        	}
		        	else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
		        		deleteValue(chosenTeams, usedTeamStats[d[0]][0]);
		        	}
		        	else{
		        		chosenTeams.push(usedTeamStats[d[0]][0]);
		        	}
		        	moveLogos();
		        });
//	graphLines = svg.selectAll("path.line")
//			.data(dataset)
//			.enter()
//			.append("svg:path")
//			.attr("class", "line")
////			.attr("d", function(d){
////				var dset = [];
////				for(var i = 0; i < matchday; i++){
////					dset.push(d[1][i]);
////				}
////				return line(dset);
////			})
//			.attr("d", function(d){
//				return line(d[2]);
//			})
//			.attr("opacity", function(d){
////				if(d[1] != matchday){
////					return 0;
////				}
////				else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
////					return 1;
////				}
////				else if(contains(chosenTeams, "All")){
////					return 1;
////				}
////		    	return 0;
//				return 1;
//			})
//			.attr("stroke","steelblue")
//			.attr("stroke-width", function(d){
//				if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//					return 4;
//				}
//				return 2;
//			})
//		    .on("mouseover", function(d){
//		    	if(d[1] == matchday && contains(chosenTeams, usedTeamStats[d[0]][0])){
//		    		d3.select(this).style("opacity", 1);	
//		    	}
//		    })
//		    .on("mouseout", function(d){
//		    	if(d[1] == matchday && (contains(chosenTeams, usedTeamStats[d[0]][0]) || contains(chosenTeams, "All"))){
//		    		d3.select(this).style("opacity", 1);
//		    	}
//		    	else{
//		    		d3.select(this).style("opacity", 0);
//		    	}
//		    });
//		    .on("click", function(d){
//		    	if(contains(chosenTeams, "All")){
//		    		deleteValue(chosenTeams, "All");
//		    		chosenTeams.push(usedTeamStats[d[0]][0]);
//		    	}
//		    	else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//		    		deleteValue(chosenTeams, usedTeamStats[d[0]][0]);
//		    	}
//		    	else{
//		    		chosenTeams.push(usedTeamStats[d[0]][0]);
//		    	}
//		    	newMatchdays();
//		    })
//			.append("svg:title")
//			.text(function(d){
//				return usedTeamStats[d[0]][0];	
//			});
	
//	for (var i = 0; i<=numberOfMatches; i++){
//		var logostring = "image.logo" + i;
//		var logos = svg.selectAll(logostring)
//			.data(usedTeamStats)
//			.enter()
//			.append("image")
//			.attr("xlink:href", function(d) {return getImage(d);})
//			.attr("height", logoSize)
//			.attr("width", logoSize)
//			.attr("opacity", function(d) {
//				if(contains(chosenTeams,"All")){
//					if(i == matchday) return 1;
//					else return 0;					
//				}
//				if(!contains(chosenTeams,d[0])) return 0;//bepaalt welk team
//				if(i > matchday) return 0;
//				if(i == matchday) return 1;
//				if(i < matchday) return 0.2 + Math.pow(0.7,matchday-i)
//			})
//			.attr("x", function(d) {
//				return xScale(d[1][i][1]) - logoSize/2;
//			})
//			.attr("y", function(d) {
//				return yScale(d[1][i][visualizedResult][0] - i) - logoSize/2;
//			});
//		teamlogos.push(logos);
//	}
	
	moveLogos();
}

function moveLogos(){
//	graphLines.remove();
//	graphLines = svg.selectAll("path.line")
//		.data(dataset)
//		.enter()
//		.append("svg:path")
//		.attr("class", "line")
//		.attr("d", function(d){
//			var dset = [];
//			for(var i = 0; i < matchday; i++){
//				dset.push(d[1][i]);
//			}
//			return line(dset);
//		})
//		.attr("opacity", function(d){
//			if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//				return 1;
//			}
//			else if(contains(chosenTeams, "All")){
//				return 1;
//			}
//			return 0.25;
//		})
//		.attr("stroke","steelblue")
//		.attr("stroke-width", function(d){
//			if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//				return 4;
//			}
//			return 2;
//		})
//		.on("mouseover", function(){d3.select(this).style("opacity", 1);})
//		.on("mouseout", function(d){
//			if(contains(chosenTeams, usedTeamStats[d[0]][0]) || contains(chosenTeams, "All")){
//				d3.select(this).style("opacity", 1);
//			}
//			else{
//				d3.select(this).style("opacity", 0.25);
//			}
//		})
//		.on("click", function(d){
//			if(contains(chosenTeams, "All")){
//				deleteValue(chosenTeams, "All");
//				chosenTeams.push(usedTeamStats[d[0]][0]);
//			}
//			else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//				deleteValue(chosenTeams, usedTeamStats[d[0]][0]);
//			}
//			else{
//				chosenTeams.push(usedTeamStats[d[0]][0]);
//			}
//			newMatchdays();
//		})
//		.append("svg:title")
//		.text(function(d){
//			return usedTeamStats[d[0]][0];	
//		});

	teamlogos.transition()
			.duration(1000)
			.attr("opacity", function(d) {
				if(contains(chosenTeams,"All")){
					if(d[1] == matchday) return 1;
					else return 0;					
				}
				if(!contains(chosenTeams,usedTeamStats[d[0]][0])) return 0;//bepaalt welk team
				if(d[1] > matchday) return 0;
				if(d[1] == matchday) return 1;
				if(d[1] < matchday) return 0.2 + Math.pow(0.7,matchday-d[1])	
			});
	
//	graphLines.transition()
//			.duration(1000)
////			.attr("opacity", function(d){
////				if(d[1] != matchday){
////					return 0;
////				}
////				else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
////					return 1;
////				}
////				else if(contains(chosenTeams, "All")){
////					return 1;
////				}
////		    	return 0;
////			})
//			.attr("opacity", function(d) {
////				if(d[1] != matchday) return 0;
////				if(contains(chosenTeams,"All")){
////					if(d[1] == matchday) return 1;
////					else return 0;					
////				}
////				if(!contains(chosenTeams,usedTeamStats[d[0]][0])) return 0;//bepaalt welk team
//				return 1;
//			});
		
	matchdayText.text(function() {
			return "Matchday: " + matchday;
		});
		
	matchText.text(function(d) {
//			if(!contains(chosenTeams,d[0])) return "";
			if(d[0] != chosenTeams[0]) return "";
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
	
	matchText2.text(function(d) {
//			if(!contains(chosenTeams,d[0])) return "";
			if(d[0] != chosenTeams[0]) return "";
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
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [3, data[i]["FTHG"], data[i]["FTAG"], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]], [0,0,0,0,0], [0,0,0,0,0], data[i]["HY"], data[i]["HR"]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [0, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365H"],data[i]["BWH"],data[i]["GBH"],data[i]["IWH"],data[i]["LBH"]], data[i]["AY"], data[i]["AR"]]);
		}
		if(data[i]["FTR"] == "D"){
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [1, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0], data[i]["HY"], data[i]["HR"]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [1, data[i]["FTAG"], data[i]["FTHG"], [0,0,0,0,0], [data[i]["B365D"],data[i]["BWD"],data[i]["GBD"],data[i]["IWD"],data[i]["LBD"]], [0,0,0,0,0], data[i]["AY"], data[i]["AR"]]);
		}
		if(data[i]["FTR"] == "A"){
			giveteamStats(data[i]["Season"], data[i]["HomeTeam"], data[i]["Matchday"], [0, data[i]["FTHG"], data[i]["FTAG"], [0,0,0,0,0], [0,0,0,0,0], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]], data[i]["HY"], data[i]["HR"]]);
			giveteamStats(data[i]["Season"], data[i]["AwayTeam"], data[i]["Matchday"], [3, data[i]["FTAG"], data[i]["FTHG"], [data[i]["B365A"],data[i]["BWA"],data[i]["GBA"],data[i]["IWA"],data[i]["LBA"]], [0,0,0,0,0], [0,0,0,0,0], data[i]["AY"], data[i]["AR"]]);
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
			teamTotalStats[i][1][j][1][0] = [0, 0, 0, 0, 0, 0, [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], [0,0,0,0,0], 0, 0, 0, 0];
			teamTotalStats[i][1][j][1][1] = [teamStats[i][1][j][1][1][0], teamStats[i][1][j][1][1][0], teamStats[i][1][j][1][1][1], teamStats[i][1][j][1][1][1], teamStats[i][1][j][1][1][2], teamStats[i][1][j][1][1][2], teamStats[i][1][j][1][1][3], teamStats[i][1][j][1][1][3], teamStats[i][1][j][1][1][4], teamStats[i][1][j][1][1][4], teamStats[i][1][j][1][1][5], teamStats[i][1][j][1][1][5], teamStats[i][1][j][1][1][6], teamStats[i][1][j][1][1][6], teamStats[i][1][j][1][1][7], teamStats[i][1][j][1][1][7]];
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
				var totYellow = teamTotalStats[i][1][j][1][l-1][13] + teamStats[i][1][j][1][l][6];
				var totRed = teamTotalStats[i][1][j][1][l-1][15] + teamStats[i][1][j][1][l][7];
				teamTotalStats[i][1][j][1][l] = [teamStats[i][1][j][1][l][0], totPoints, teamStats[i][1][j][1][l][1], totFgoals, teamStats[i][1][j][1][l][2], totAgoals, teamStats[i][1][j][1][l][3], totWodds, teamStats[i][1][j][1][l][4], totDodds, teamStats[i][1][j][1][l][5], totLodds, teamStats[i][1][j][1][l][6], totYellow, teamStats[i][1][j][1][l][7], totRed];
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
				matches[data[i]["Matchday"]].push([data[i]["HomeTeam"], data[i]["AwayTeam"], data[i]["FTHG"], data[i]["FTAG"], data[i]["B365H"], data[i]["B365D"], data[i]["B365A"], data[i]["HY"], data[i]["AY"], data[i]["HR"], data[i]["AR"]]);
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
					result = {HomeTeam: matchData[i][1][matchday][j][0], AwayTeam: matchData[i][1][matchday][j][1], FTHG: matchData[i][1][matchday][j][2], FTAG: matchData[i][1][matchday][j][3], OddsH: matchData[i][1][matchday][j][4], OddsD: matchData[i][1][matchday][j][5], OddsA: matchData[i][1][matchday][j][6], HomeYellow: matchData[i][1][matchday][j][7], AwayYellow: matchData[i][1][matchday][j][8], HomeRed: matchData[i][1][matchday][j][9], AwayRed: matchData[i][1][matchday][j][10]}
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

function getPosition(team, matchday){
	for(var i = 0; i < positions.length; i++){
		if(positions[i][0] == team){
			return positions[i][1][matchday];
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











