var svgmargin = 0;
var menuwidth = 200;
var svgwidth = screen.width - svgmargin;
console.log("Width: " + svgwidth);
var svg1width = svgwidth*(2/3);
var svg2width = svgwidth*(1/3);
var buttonheight = 160;
var svgheight = screen.height - svgmargin - buttonheight;
console.log("Height: " + svgheight);
var leftPadding1 = 100;
var rightPadding1 = 0;
var leftPadding2 = 50;
var rightPadding2 = 100;
//var leftPadding = 50;
//var rightPadding = 50;
var topPadding = 50;
var bottomPadding = 200;
var middleMargin = 100;
var barHeight = (svgheight-topPadding-middleMargin-bottomPadding)/2;
var logoSize = 40;

var buttonPushed = 0;
var playing = 0;
var chosenTeams = [];
var logoFactor = 1.5;
var logoSize = 20;
var svg2LogoOpacity = 0.25;
var svg2LineOpacity = 0.2;

var data = [];
var teamStats = new Array();
var teamTotalStats = new Array(); //Consists of all the stats for the 20 teams and 38 matchdays
var maxPoints = new Array();
var matchData = [];
var usedTeamStats;
var usedSeason = 0;
var numberOfTeams = 20;
var numberOfMatches = 38;
var minSize = 0.7*((svg1width-leftPadding1-rightPadding1)/numberOfTeams);
var maxSize = ((svg1width-leftPadding1-rightPadding1)/numberOfTeams);
var seasons = [];
var svg1;
var svg2; //The svg2 containing the whole visualization
var textsvg;

var matchday = 0;
var compMatchday = 0
var leftMatchday = 0;
var rightMatchday = 8;

var psuedosvg1;
var psuedosvg2;

var xScale;
var yScale;
var xAxis;
var xGrid;
var yAxis;
var yGrid;

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
var pointScale;
var pointAxis;
var pointGrid;
var goalScale;
var goalAxis;
var goalGrid;

var positionMatchday = 0;
var positions = [];

var graphLines = [];
var graphPoints = [];

var navLinks = [];

d3.select("body").attr("background", "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/background.jpg");

svg1 = d3.select("#content1")
		.append("svg:svg")
		.attr("width", svg1width)
		.attr("height",svgheight);

svg2 = d3.select("#content2")
		.append("svg:svg")
		.attr("width", svg2width)
		.attr("height",svgheight);

textsvg = d3.select("#textsvg")
		.append("svg:svg")
		.attr("width", screen.width-svgmargin)
		.attr("height", 80);

$(function() {
	  $("#dayslider").slider({
		  orientation: "horizontal",
	      range: "min",
//		  range: true,
	      step: 1,
//	      values: [0,38],
	      value: 0,
	      min: 0,
	      max: 38,
//	      slide: refreshSlider,
	      change: refreshSlider
	  });
});


//$(function() {
//	$( "#menu" ).menu();
//});

//function loadMenu(){
//
//	navLinks = [];
//    // All items we'd like to add
//    var navItems = [];
//    for (var i = 0; i < usedTeamStats.length; i++){
//    	navItems.push({href: '#', text: usedTeamStats[i][0], id: usedTeamStats[i][0]});
//    	console.log(usedTeamStats[i][0]);
//    }
//    navItems.push({href: '#', text: "All", id: "All"});
//    var navItem, navLink;
//    
//    var navList = document.getElementById("menu");
//    
//    // Cycle over each nav item
//    for (var i = 0; i < navItems.length; i++) {
//        // Create a fresh list item, and anchor
//        navItem = document.createElement("li");
//        navLink = document.createElement("a");
//        
//        // Set properties on anchor
//        navLink.href = navItems[i].href;
//        navLink.id = navItems[i].id;
//        navLink.onclick = function(){
//        	selectTeam(this.id);
//        	navLink 
//        	return false;
//        };
//        navLink.innerHTML = navItems[i].text;
//        if(contains(chosenTeams, navItems[i].text)){
//        	navLink.style.color = "blue";
//        	navLink.style.opacity = 1;
//        }
//        else{
//        	navLink.style.color = "#CC0000";
//        	navLink.style.opacity = 0.75        	
//        }
//        
//        navLinks.push(navLink);
//        
//        // Add anchor to list item, and list item to list
//        navItem.appendChild(navLink);
//        navList.appendChild(navItem);
//    }
//};

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
	
//	for(var i = 0; i < navLinks.length; i++){
//		if(contains(chosenTeams, navLinks[i].innerHTML)){
//			navLinks[i].style.color = "blue";
//			navLinks[i].style.opacity = 1;
//		}
//		else{
//			navLinks[i].style.color = "#CC0000";
//			navLinks[i].style.opacity = 0.75;
//		}
//	}
	newMatchday();
}

function refreshSlider(){
	console.log("Value: " + $("#dayslider").slider("value"));
	if(!buttonPushed){
//		leftMatchday = $("#dayslider").slider("values", 0);
//		rightMatchday =  $("#dayslider").slider("values", 1);
		matchday = $("#dayslider").slider("value");
		compMatchday = Math.max(0,matchday - 1);
	}
	if(matchday < 4){
		leftMatchday = 0;
		rightMatchday = 8;
	}
	else if(matchday > (numberOfMatches - 4)){
		leftMatchday = numberOfMatches - 8;
		rightMatchday = numberOfMatches;
	}
	else {
		leftMatchday = matchday - 4;
		rightMatchday = matchday + 4;
	}
	buttonPushed = 0;
	console.log("Slided");
	newMatchday();
}

$(function() {
    $( "input[type=submit]" )
      .button();
  });

$(function() {
    $( "#radio" ).buttonset();
  });


//$(function() {
//	$( "#spinner" ).spinner({
//	      min: 0,
//	      max: 38,
//	      change: function (event, ui){
//	    	  compMatchday = ui.value;
//	      },
//		  spin: function (event, ui){
//	    	  compMatchday = ui.value;
//		  }
//	});
//	$( "#spinner" ).spinner( "value", 0);
//  })

$(function() {
    $( "#leaguebutton" ).button();
  });

$(function() {
    $( "#seasonbutton" ).button();
  });

$(function() {
    $('#menu1').dropit();
    $('#menu2').dropit();
});

changeLeague("Premier League");

function changeLeague(league){
	var myNode = document.getElementById("seasonmenu");
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
	if(league == "Premier League"){
		$("#leaguebutton span").text("Premier League");
	    // All items we'd like to add
	    var navItems = [];
    	navItems.push({href: '#', text: "2011-2012", id: "2011-2012"});
		$("#seasonbutton span").text("2011-2012");
    	navItems.push({href: '#', text: "2012-2013", id: "2012-2013"});
	    var navItem, navLink;
	    
	    var navList = document.getElementById("seasonmenu");
	    
	    // Cycle over each nav item
	    for (var i = 0; i < navItems.length; i++) {
	        // Create a fresh list item, and anchor
	        navItem = document.createElement("li");
	        navLink = document.createElement("a");
	        
	        // Set properties on anchor
	        navLink.href = navItems[i].href;
	        navLink.id = navItems[i].id;
	        navLink.innerHTML = navItems[i].text;
	        navLink.onclick = function(){
	    		$("#seasonbutton span").text(this.id);
	        	navLink 
	        	return false;
	        };
	        
	        // Add anchor to list item, and list item to list
	        navItem.appendChild(navLink);
	        navList.appendChild(navItem);
	    }
	} 
	else if(league == "Jupiler Pro League"){
		$("#leaguebutton span").text("Jupiler Pro League");
		$("#seasonbutton span").text(" ");
		
	}
	
}

//(function($){
//
//    $(document).ready(function() {
//        $('#menu1').dropit();
//        $('#menu2').dropit({ action: 'hover' });
//    });
    
//    hljs.initHighlightingOnLoad();

//})(window.jQuery);

//Is called when button "plus" is clicked
function button1Plus(){
//	if(leftMatchday < rightMatchday){
//		leftMatchday++;
//		buttonPushed = 1;
//		$( "#dayslider" ).slider("values", 0, leftMatchday );
//	}
//	console.log("Pressed +");
	if(matchday < numberOfMatches){
		matchday++;
		compMatchday = Math.max(0,matchday - 1);
		buttonPushed = 1;
		$( "#dayslider" ).slider("value", matchday );
//		if(matchday < 4){
//			leftMatchday = 0;
//			rightMatchday = 8;
//		}
//		else if(matchday > (numberOfMatches - 4)){
//			leftMatchday = numberOfMatches - 8;
//			rightMatchday = numberOfMatches;
//		}
//		else {
//			leftMatchday = matchday - 4;
//			rightMatchday = matchday + 4;
//		}
		if(playing){
			window.setTimeout(button1Plus,1000);
//			button1Plus();
		}
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');		
	}
}

//Is called when button "minus is clicked
function button1Minus(){
//	if(leftMatchday > 0){
//		leftMatchday--;
//		buttonPushed = 1;
//		$( "#dayslider" ).slider("values", 0, leftMatchday );
//	}
//	console.log("Pressed -");
	if(matchday > 0){
		matchday--;
		compMatchday = Math.max(0,matchday - 1);
		buttonPushed = 1;
		$( "#dayslider" ).slider("value", matchday );
//		if(matchday < 4){
//			leftMatchday = 0;
//			rightMatchday = 8;
//		}
//		else if(matchday > (numberOfMatches - 4)){
//			leftMatchday = numberOfMatches - 8;
//			rightMatchday = numberOfMatches;
//		}
//		else {
//			leftMatchday = matchday - 4;
//			rightMatchday = matchday + 4;
//		}
	}
}

function play(){
	if(!playing){
		playing = 1;
//		$( "#playpause" ).button( "option", "value", "Pause" );
		$("#playpause").prop('value', 'Pause');
		button1Plus();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');
	}
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

//Loads the data from a Google Spreadsheet and calls the visualizesvg2 function
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
//	loadMenu();
	visualizesvg1();
	visualizesvg2();
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
	setMaxPoints();
	setPositions();
	
}

function visualizesvg1(){
psuedosvg1 = svg1.append("svg1:g");
	
	pointScale = d3.scale.linear()
		.domain([0, d3.max(usedTeamStats, function(d) { return d[1][numberOfMatches][1]; })])
		.range([0, barHeight]);
	goalScale = d3.scale.linear()
		.domain([0, d3.max(usedTeamStats, function(d) { return Math.max(d[1][numberOfMatches][3],d[1][numberOfMatches][5]); })])
		.range([barHeight, 0]);
	
	pointBars = psuedosvg1.selectAll("rect.pointbar")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 1)
		.attr("opacity",0.3)
		.attr("width", minSize)
		.attr("stroke", "#FF0000");
//		.attr("stroke", "#C7C7C7");
	//	.on("mouseover", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7);
	//	})
	//	.on("mouseout", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
	//	});
	
	newPointBars = psuedosvg1.selectAll("rect.newpointbar")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("y", topPadding)
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 1)
		.attr("opacity",0.85)
	//	.attr("fill", "red")
		.attr("width", minSize)
		.attr("stroke", "#FF0000");
	
	goalsScored = psuedosvg1.selectAll("rect.goalsscored")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("opacity",0.4)
		.attr("height", 0)
		.attr("width", minSize/2)
		.attr("fill", "#008000");
	//	.on("mouseover", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
	//	})
	//	.on("mouseout", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
	//	});
	newGoalsScored = psuedosvg1.selectAll("rect.newgoalsscored")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("opacity",0.8)
		.attr("width", minSize/2)
		.attr("fill", "#008000");
	goalsAgainst = psuedosvg1.selectAll("rect.goalsagainst")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        	return leftPadding1 + (i * maxSize) + maxSize/2;
		})
		.attr("opacity",0.4)
		.attr("width", minSize/2)
		.attr("fill", "#FF0000");
	//	.on("mouseover", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "2").attr("fill", "#FF0000").attr("opacity", 0.7)
	//	})
	//	.on("mouseout", function() {
	//		d3.select(this).attr("stroke", "#C7C7C7").attr("stroke-width", "0").attr("fill", "#000000").attr("opacity", 0.2)
	//	});
	newGoalsAgainst = psuedosvg1.selectAll("rect.goalsagainst")
		.data(usedTeamStats)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        	return leftPadding1 + (i * maxSize) + maxSize/2;
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
	pointAxis = psuedosvg1.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftPadding1-20) +","+topPadding+")")
		.attr("opacity", 0.5)
		.call(pointsAxis);
	pointGrid = psuedosvg1.append("g")         
		.attr("transform", "translate("+ (leftPadding1-20) +","+topPadding+")")
		.attr("class", "grid")
		.call(makePointsAxis()
		    .tickSize(-svgwidth - leftPadding1 - rightPadding1, 0, 0)
		    .tickFormat("")
		);
	
	function makeGoalsAxis(){
	return d3.svg.axis()
		.scale(goalScale)
		.orient("left")
		.ticks(8);
	}
	var goalsAxis =   makeGoalsAxis();
	goalAxis = psuedosvg1.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftPadding1-20) +","+(topPadding+barHeight+middleMargin)+")")
		.attr("opacity", 0.5)
		.call(goalsAxis);
	goalGrid = psuedosvg1.append("g")         
		.attr("transform", "translate("+ (leftPadding1-20) +","+(topPadding+barHeight+middleMargin)+")")
		.attr("class", "grid")
		.call(makeGoalsAxis()
		    .tickSize(-svgwidth - leftPadding1 - rightPadding1, 0, 0)
		    .tickFormat("")
		);
	
	teamNames = psuedosvg1.selectAll("text.names")
		.data(usedTeamStats)
		.enter()
		.append("text")
		.text(function(d) {
			return d[0];
		})
		.attr("y", topPadding - 10)
		.attr("x", function(d, i) {
	          return leftPadding1 + (i *maxSize) + maxSize/2;
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "13px")
	//	.attr("fill", "grey")
		
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	
	teamLogos = psuedosvg1.selectAll("image.logo")
		.data(usedTeamStats)
		.enter()
		.append("image")
		.attr("xlink:href", function(d) {return getImage(d);})
		.attr("height", minSize)
		.attr("width", minSize)
		.attr("opacity", 0.85)
		.attr("y", topPadding + barHeight + (middleMargin-minSize)/2)
		.attr("x", function(d, i) {
		      return leftPadding1 + (i *maxSize);
		})
	    .on("click", function(d){
	    	if(contains(chosenTeams, "All")){
	    		deleteValue(chosenTeams, "All");
	    		chosenTeams.push(d[0]);
	    	}
	    	else if(contains(chosenTeams, d[0])){
	    		deleteValue(chosenTeams, d[0]);
	    	}
	    	else{
	    		chosenTeams.push(d[0]);
	    	}
	    	selectTeam();
	    });
	//	.append("svg:title")
	//	.text(function(d) { return d[0]; });
	//	.on("mouseover", function() {
	//		d3.select(this).attr("opacity", 1);
	//	})
	//	.on("mouseout", function() {
	//		d3.select(this).attr("opacity", 0.85);
	//	});
	//	.on("click", function() {
	//		d3.select(this).attr("opacity", 1);
	//	});;
	changeSvg1();
}

	
//The main function
function visualizesvg2() {
	//Scatterplot (nummer 3)
	
	psuedosvg2 = svg2.append("svg2:g");
	
	xScale = d3.scale.linear()
		.domain([leftMatchday, rightMatchday])
		.range([leftPadding2, svg2width - rightPadding2]);

	yScale = d3.scale.linear()
		.domain([numberOfTeams, 1])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(rightMatchday-leftMatchday);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
	xAxis = psuedosvg2.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + (svgheight - bottomPadding) + ")")
			.call(x_Axis);
	xGrid = psuedosvg2.append("g")         
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
	yAxis = psuedosvg2.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + leftPadding2 + "," + 0 +")")
			.call(y_Axis);
	yGrid = psuedosvg2.append("g")         
			.attr("transform", "translate(" + leftPadding2 + "," + 0 +")")
		    .attr("class", "grid")
		    .call(makeYAxis()
			    .tickSize(-svg2width + rightPadding2 + leftPadding2, 0, 0)
			    .tickFormat("")
		    );
		
	psuedosvg2.append("text")
			.text("position")
			.attr("x", leftPadding2)
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
	
	psuedosvg2.append("text")
			.text("matchday")
			.attr("x", svg2width - rightPadding2 - 30)
			.attr("y", svgheight - bottomPadding + 40)
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr("fill", "#CC0000")
			.attr("opacity", 0.75)
			.attr("font-weight", "bold")
			.attr("text-anchor", "middle");
	
//	matchText = psuedosvg2.selectAll("text.match")
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
	
	psuedosvg2.append("line")
		.attr("x1" , xScale(leftMatchday))
		.attr("y1" , yScale(4.5))
		.attr("x2" , xScale(rightMatchday))
		.attr("y2" , yScale(4.5))
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	
	psuedosvg2.append("line")
		.attr("x1" , xScale(leftMatchday))
		.attr("y1" , yScale(7.5))
		.attr("x2" , xScale(rightMatchday))
		.attr("y2" , yScale(7.5))
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	
	psuedosvg2.append("line")
		.attr("x1" , xScale(leftMatchday))
		.attr("y1" , yScale(16.5))
		.attr("x2" , xScale(rightMatchday))
		.attr("y2" , yScale(16.5))
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	
	psuedosvg2.append("rect")
		.attr("x", xScale(matchday) - 20)
		.attr("y", yScale(0.5))
		.attr("width", 40)
		.attr("height", Math.abs(yScale(0.5)-yScale(20.5)))
		.attr("fill", "none")
		.attr("stroke", "#CC0000")
		.attr("opacity", 0.75)
		.attr("stroke-width", 5);
	
//	psuedosvg2.append("text")
//		.text("Champions League")
//		.attr("x", xScale(rightMatchday) + 20)
//		.attr("y", yScale(3))
//		.attr("font-family", "sans-serif")
//		.attr("font-size", "20px")
//		.attr("fill", "#CC0000")
//		.attr("opacity", 0.75)
//		.attr("font-weight", "bold")
//		.attr("text-anchor", "left");
//
//	psuedosvg2.append("text")
//		.text("Europe League")
//		.attr("x", xScale(rightMatchday) + 20)
//		.attr("y", yScale(6))
//		.attr("font-family", "sans-serif")
//		.attr("font-size", "20px")
//		.attr("fill", "#CC0000")
//		.attr("opacity", 0.75)
//		.attr("font-weight", "bold")
//		.attr("text-anchor", "left");
//	
//	psuedosvg2.append("text")
//		.text("Safe")
//		.attr("x", xScale(rightMatchday) + 20)
//		.attr("y", yScale(12))
//		.attr("font-family", "sans-serif")
//		.attr("font-size", "20px")
//		.attr("fill", "#CC0000")
//		.attr("opacity", 0.75)
//		.attr("font-weight", "bold")
//		.attr("text-anchor", "left");
//	
//	psuedosvg2.append("text")
//		.text("Relegation")
//		.attr("x", xScale(rightMatchday) + 20)
//		.attr("y", yScale(18.5))
//		.attr("font-family", "sans-serif")
//		.attr("font-size", "20px")
//		.attr("fill", "#CC0000")
//		.attr("opacity", 0.75)
//		.attr("font-weight", "bold")
//		.attr("text-anchor", "left");

	var line = d3.svg.line()
		.x(function(d,i) { 
			return xScale(leftMatchday + i); 
		})
		.y(function(d) { 
			return yScale(d); 
		});
	
	var dataset = [];
	var positionsDataset = [];
	for(var j = 0; j < numberOfTeams; j++){
		var temp = []
		for(var i = leftMatchday; i <= rightMatchday; i++){
			temp.push(getPosition(usedTeamStats[j][0], i));
			positionsDataset.push([j, i]);
		}
		dataset.push([j, temp]);		
	}
	
	graphLines = psuedosvg2.selectAll("path.line")
			.data(dataset)
			.enter()
			.append("svg:path")
			.attr("class", "line")
			.attr("d", function(d){
				return line(d[1]);
			})
			.attr("opacity", function(d){
				if(contains(chosenTeams, usedTeamStats[d[0]][0])){
					return 1;
				}
				else if(contains(chosenTeams, "All")){
					return 1;
				}
		    	return svg2LineOpacity;
			})
			.attr("stroke","steelblue")
			.attr("stroke-width", function(d){
				if(contains(chosenTeams, usedTeamStats[d[0]][0])){
					return 4;
				}
				return 2;
			})
		    .on("mouseover", function(d){
		    	d3.select(this).attr("opacity", 1);
		    	graphPoints.attr("opacity", function(d2){
		    		if(d2[0] == d[0]) return 1;
		    		if(contains(chosenTeams, usedTeamStats[d2[0]][0]) || contains(chosenTeams, "All") || (d2[1]==matchday)) return 1;
		    		else return svg2LogoOpacity;
		    	})
		    })
		    .on("mouseout", function(d){
		    	if(contains(chosenTeams, usedTeamStats[d[0]][0]) || contains(chosenTeams, "All")){
		    		d3.select(this).attr("opacity", 1);
		    	}
		    	else{
		    		d3.select(this).attr("opacity", svg2LineOpacity);
		    	}
		    	graphPoints.attr("opacity", function(d2){
		    		if(contains(chosenTeams, usedTeamStats[d2[0]][0]) || contains(chosenTeams, "All") || (d2[1]==matchday)) return 1;
		    		else return svg2LogoOpacity;
		    	})
		    })
		    .on("click", function(d){
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
		    	selectTeam();
		    });
//			.append("svg2:title")
//			.text(function(d){
//				return usedTeamStats[d[0]][0];	
//			});
		
	var div = d3.select("#content2").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);

	graphPoints = psuedosvg2.selectAll("image.logo")
					.data(positionsDataset)
					.enter()
					.append("image")
					.attr("xlink:href", function(d){
						return getImage(usedTeamStats[d[0]]);
					})
					.attr("height", function(d){
						if(contains(chosenTeams, usedTeamStats[d[0]][0])){
							return logoSize*logoFactor;
						}
//						if(contains(chosenTeams, "All")){
//							return logoSize*logoFactor;
//						}
						return logoSize;
					})
					.attr("width", function(d){
						if(contains(chosenTeams, usedTeamStats[d[0]][0])){
							return logoSize*logoFactor;
						}
//						if(contains(chosenTeams, "All")){
//							return logoSize*logoFactor;
//						}
						return logoSize;
					})
			        .attr("x", function(d){
						if(contains(chosenTeams, usedTeamStats[d[0]][0])){
							return xScale(d[1])-(logoSize/2)*logoFactor;
						}
						if(contains(chosenTeams, "All")){
							return xScale(d[1])-(logoSize/2)*logoFactor;
						}
			        	return xScale(d[1])-(logoSize/2)
			        })
			        .attr("y", function(d){
						if(contains(chosenTeams, usedTeamStats[d[0]][0])){
							return yScale(getPosition(usedTeamStats[d[0]][0], d[1]))-(logoSize/2)*logoFactor;
						}
						if(contains(chosenTeams, "All")){
							return yScale(getPosition(usedTeamStats[d[0]][0], d[1]))-(logoSize/2)*logoFactor;
						}
			        	return yScale(getPosition(usedTeamStats[d[0]][0], d[1]))-(logoSize/2);
			        })
			        .attr("opacity", function(d){
						if(contains(chosenTeams, usedTeamStats[d[0]][0])  || (d[1]==matchday)){
							return 1;
						}
						if(contains(chosenTeams, "All")){
							return 1;
						}
						return svg2LogoOpacity;
			        })	
					.on("mouseover", function(d) { 
//						d3.select(this).attr("opacity", 1);
						graphLines.attr("opacity", function(d2, i2){
							if(d2[0] == d[0]) return 1;
							if(contains(chosenTeams, usedTeamStats[d2[0]][0]) || contains(chosenTeams, "All")) return 1;
							else return svg2LineOpacity;
						});
						graphPoints.attr("opacity", function(d1){
							if(d1[0] == d[0]) return 1;
				    		if(contains(chosenTeams, usedTeamStats[d1[0]][0]) || contains(chosenTeams, "All") || (d1[1]==matchday)) return 1;
							else return svg2LogoOpacity;
						});
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
			        		div.html("<b><big><big>" + usedTeamStats[d[0]][0] + "</big></big></b><br/>" + "<i>Matchday: </i>" + "<b>" + d[1] + "</b><br/><i>Number of points: </i>" + "<b>" + points + "</b><br/>" + "<i>Goals made: </i>" + "<b>" + goalsMade + "</b><br/>" + "<i>Goals against: </i>" + "<b>" + goalsAgainst + "</b><br/>" + "<small><i>Last match: </i></small>" + "<br/>" + "   " + "<big><b>" + text + "</big></b>")  
				        		.style("left", (d3.event.pageX) + "px")     
//				        		.style("top", (d3.event.pageY - div.attr("height")) + "px");
			        			.style("top", (d3.event.pageY - 125) + "px");				        		
			        	}
					})                  
			        .on("mouseout", function(d) { 
			        	graphPoints.attr("opacity", function(d1){
				    		if(contains(chosenTeams, usedTeamStats[d1[0]][0]) || contains(chosenTeams, "All") || (d1[1]==matchday)) return 1;
				    		else return svg2LogoOpacity;
			        	});
				    	graphLines.attr("opacity", function(d2, i2){
				    		if(contains(chosenTeams, usedTeamStats[d2[0]][0]) || contains(chosenTeams, "All")) return 1;
				    		else return svg2LineOpacity;
				    	});
//			        	if(contains(chosenTeams, "All")){
//			        		d3.select(this).attr("opacity", 1);
//						}    
//			        	else if(contains(chosenTeams, usedTeamStats[d[0]][0])){
//			        		d3.select(this).attr("opacity", 1);
//			        	}
//			        	else{
//			        		d3.select(this).attr("opacity", 0.15);
//			        	}
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
			        	selectTeam();
			        });
	
}

function newMatchday(){
//	for(var i = 0; i < navLinks.length; i++){
//		if(contains(chosenTeams, navLinks[i].innerHTML)){
//			navLinks[i].style.color = "blue";
//			navLinks[i].style.opacity = 1;
//		}
//		else{
//			navLinks[i].style.color = "#CC0000";
//			navLinks[i].style.opacity = 0.75;
//		}
//	}
	sortData();
	console.log(teamLogos.length);
	changeSvg1();
	changeSvg2();
}

function selectTeam(){
	changeSvg2();
	changeSvg1Selections();
}

function changeSvg2(){
	psuedosvg2.remove();
	graphPoints = [];
	graphLines = [];
	visualizesvg2();	
}

function changeSvg1Selections(){
	teamLogos.attr("opacity", function(d){
	    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
	    		return 1;
	    	}
	    	else{
	    		return 0.7;
	    	}
			})
			.attr("width", function(d){
				if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")) return maxSize;
				else return minSize;
			})
			.attr("height", function(d){
				if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")) return maxSize;
				else return minSize;
			})
			.attr("y", function(d, i) {
				var width;
				if(contains(chosenTeams,d[0])) width = maxSize;
				else width = minSize;		
				return topPadding + barHeight + (middleMargin-width)/2;
			})
			.attr("x", function(d, i) {
				var width;
				if(contains(chosenTeams,d[0])) width = maxSize;
				else width = minSize;		
				return leftPadding1 + (i * maxSize) + (maxSize/2) - width/2;
			});
	pointBars.attr("opacity", function(d){
	    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")) return 0.5;
	    	else return 0.3;
		})
		.attr("stroke-width", function(d) {
			if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")) return 2;
			else return 0;
		});
//		.attr("fill", function(d) {
//			if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")) return "#FF0000";
//			else return "#000000";
//		});
	newPointBars.attr("opacity", function(d){
    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
    		return 1;
    	}
    	else{
    		return 0.85;
    	}
	});
	goalsScored.attr("opacity", function(d){
    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
    		return 0.6;
    	}
    	else{
    		return 0.4;
    	}
	});
	newGoalsScored.attr("opacity", function(d){
    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
    		return 1;
    	}
    	else{
    		return 0.8;
    	}
	});
	goalsAgainst.attr("opacity", function(d){
    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
    		return 0.6;
    	}
    	else{
    		return 0.4;
    	}
	});
	newGoalsAgainst.attr("opacity", function(d){
    	if(contains(chosenTeams, d[0]) || contains(chosenTeams, "All")){
    		return 1;
    	}
    	else{
    		return 0.8;
    	}
	});
}

function changeSvg1(){	
	sortData();
	var div = d3.select("#content1").append("div")   
	    .attr("class", "tooltip")               
	    .style("opacity", 0);
	teamLogos.transition()           
		.duration(1000)
//		.attr("height", function(d) { 
//			if(maxPoints[matchday] == 0){
//				return minSize
//			}
//			else{
//				return minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
//			}
//		})
//		.attr("width", function(d) { 
//			if(maxPoints[matchday] == 0){
//				return minSize
//			}
//			else{
//				return minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
//			}
//		})
		.attr("y", function(d, i) {
			var width;
//			if(maxPoints[matchday] == 0){
//				width = minSize;
//			}
//			else{
//				width = minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
//			}
			if(contains(chosenTeams,d[0])) width = maxSize;
			else width = minSize;		
			return topPadding + barHeight + (middleMargin-width)/2;
		})
		.attr("x", function(d, i) {
			var width;
//			if(maxPoints[matchday] == 0){
//				width = minSize;
//			}
//			else{
//				width = minSize+(maxSize-minSize)*(d[1][matchday][1]/maxPoints[matchday])				
//			}
			if(contains(chosenTeams,d[0])) width = maxSize;
			else width = minSize;		
			return leftPadding1 + (i * maxSize) + (maxSize/2) - width/2;
		});
	teamLogos.on("mouseover", function(d, i) { 
			d3.select(this).attr("opacity", 1);
    		var match = 0;
    		if(usedSeason == 0){
    			match = findMatch("2011-2012", matchday, d[0]);	
    		}
    		if(usedSeason == 1){
    			match = findMatch("2012-2013", matchday, d[0]);	
    		}
    		var postion = i;
    		var points = d[1][matchday][1];
    		var goalsMade = d[1][matchday][3];
    		var goalsAgainst = d[1][matchday][5];
    		var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
    		div.transition()        
        		.duration(200)      
        		.style("opacity", 0.9);      
    		div.html("<b><big><big>" + d[0] + "</big></big></b><br/>" + "<i>Matchday: </i>" + "<b>" + matchday + "</b><br/><i>Number of points: </i>" + "<b>" + points + "</b><br/>" + "<i>Goals made: </i>" + "<b>" + goalsMade + "</b><br/>" + "<i>Goals against: </i>" + "<b>" + goalsAgainst + "</b><br/>" + "<small><i>Last match: </i></small>" + "<br/>" + "   " + "<big><b>" + text + "</big></b>")  
        		.style("left", (d3.event.pageX) + "px")     
//				        		.style("top", (d3.event.pageY - div.attr("height")) + "px");
    			.style("top", (d3.event.pageY - 125) + "px");		
		})                  
        .on("mouseout", function(d) { 
    		d3.select(this).attr("opacity", 0.85);
            div.transition()        
                .duration(500)      
                .style("opacity", 0);   
        });
	teamNames.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
	          return leftPadding1 + (i * maxSize) + maxSize/2;
		});
	newPointBars.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
			return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("height", function(d) {
			return Math.abs(pointScale(d[1][matchday][1]) - pointScale(d[1][Math.max(0,compMatchday)][1]));
		});
	pointBars.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
          	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("y", function(d) {
			return topPadding + Math.abs(pointScale(d[1][matchday][1]) - pointScale(d[1][Math.max(0,compMatchday)][1]));	
		})
		.attr("height", function(d) {
			return pointScale(d[1][Math.max(0,compMatchday)][1]);	
		});
//	goalsScored.transition()           
//		.duration(1000)
//		.attr("x", function(d, i) {
//	          	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
//		})
//		.attr("y", function(d){
//			return svgheight - (barHeight - goalScale(d[1][Math.max(0,matchday-1)][3])) - bottomPadding;
//		})
//		.attr("height", function(d) {
//			return barHeight - goalScale(d[1][Math.max(0,matchday-1)][3]);
//		});
//	newGoalsScored.transition()           
//		.duration(1000)
//		.attr("x", function(d, i) {
//          	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
//		})
//		.attr("y", function(d){
//			return svgheight - (barHeight - goalScale(d[1][matchday][3])) - bottomPadding;	
//		})
//		.attr("height", function(d) {
//			return Math.abs(goalScale(d[1][Math.max(0,matchday-1)][3]) - goalScale(d[1][matchday][3]));
//		});
	goalsScored.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
	          	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("y", function(d){
			return svgheight - (barHeight - goalScale(d[1][matchday][3])) - bottomPadding;
		})
		.attr("height", function(d) {
			return barHeight - goalScale(d[1][Math.max(0,compMatchday)][3]);
		});
	newGoalsScored.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
	      	return leftPadding1 + (i * maxSize) + maxSize/2 - minSize/2;
		})
		.attr("y", function(d){
			return svgheight - Math.abs(goalScale(d[1][Math.max(0,compMatchday)][3]) - goalScale(d[1][matchday][3])) - bottomPadding;	
		})
		.attr("height", function(d) {
			return Math.abs(goalScale(d[1][Math.max(0,compMatchday)][3]) - goalScale(d[1][matchday][3]));
		});
	
	goalsAgainst.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
	        return leftPadding1 + (i * maxSize) + maxSize/2;
		})
		.attr("y", function(d){
			return svgheight - (barHeight - goalScale(d[1][matchday][5])) - bottomPadding;
		})
		.attr("height", function(d) {
			return barHeight - goalScale(d[1][Math.max(0,compMatchday)][5]);
		});
	newGoalsAgainst.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
          	return leftPadding1 + (i * maxSize) + maxSize/2;
		})
		.attr("y", function(d){
			return svgheight - Math.abs(goalScale(d[1][Math.max(0,compMatchday)][5]) - goalScale(d[1][matchday][5])) - bottomPadding;		
		})
		.attr("height", function(d) {
			return Math.abs(goalScale(d[1][Math.max(0,compMatchday)][5]) - goalScale(d[1][matchday][5]));
		});
}

function changeSeason(seasonNumber){
	usedSeason = seasonNumber;
	usedTeamStats = teamTotalStats[usedSeason][1];
	psuedosvg2.remove();
	graphPoints = [];
	graphLines = [];
//	var myNode = document.getElementById("menu");
//	while (myNode.firstChild) {
//	    myNode.removeChild(myNode.firstChild);
//	}
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
//	loadMenu();
	setPositions();
	visualizesvg1();
	visualizesvg2();
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
//		rightMatchday = numberOfMatches;
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
	var result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Arsenal.png";
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

function comparePosData(data1,data2){
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

function setPositions(){
	positions = [];
	for(var i = 0; i < numberOfTeams; i++){
		positions.push([usedTeamStats[i][0], new Array(numberOfMatches+1)]);
	}
	var positionLogos = svg2.selectAll("circle.pos")
						.data(usedTeamStats)
						.enter()
						.append("circle")
						.attr("opacity", 0);
	
	for(var i = 0; i <= numberOfMatches; i++){
		positionMatchday = i;
		positionLogos.sort(comparePosData).order();
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










