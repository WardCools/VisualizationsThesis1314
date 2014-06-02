var svgwidth = screen.width;
var leftsvgwidth = svgwidth*(2/3);
var rightsvgwidth = svgwidth - leftsvgwidth;
var headerheight = 160;
var svgheight = screen.height - headerheight;
var leftPadding = 75;
var rightPadding = 100;
var topPadding = 50;
var bottomPadding = 200;
var textsvg;
var svg;
var psuedosvga;
var psuedosvgb;
var barwidth = rightsvgwidth - 200;
var rightFlagPadding = 75;
var rightNamePadding = 125;
var rightGraphPadding = 250;

var minYear = 1985;
var maxYear = 2012;
var currentYear = 1985;
var compYear = 1985;
var yearsShown = 10;
var leftYear = currentYear - yearsShown;
var rightYear = currentYear;
var playing = false;
var currentYearButtonPushed = false;
var playButtonPushed = false;
var resetComp = true;

var dataName = "EU_dataset_final_95.csv";
var data;
var countries = [];
var countryColors = [["Austria", "#b21c29"],
					["Belgium", "#664028"],
					["Bulgaria", "#8e887c"],
					["Croatia", "#84566d"],
					["Cyprus", "#f2ae3a"],
					["Czech Republic", "#966c78"],
					["Denmark", "#8c3546"],
					["Estonia", "#6a7784"],
					["Finland", "#7790b2"],
					["France", "#896a83"],
					["Germany", "#4f2000"],
					["Greece", "#517aa3"],
					["Hungary", "#997a77"],
					["Ireland", "#8a8e63"],
					["Italy", "#8c887b"],
					["Latvia", "#845458"],
					["Lithuania", "#604c2c"],
					["Luxembourg", "#988ea5"],
					["Malta", "#b53f4f"],
					["Netherlands", "#877282"],
					["Poland", "#bc314c"],
					["Portugal", "#541c05"],
					["Romania", "#6b4b3e"],
					["Slovakia", "#96677b"],
					["Slovenia", "#8e7687"],
					["Spain", "#773911"],
					["Sweden", "#4b6059"],
					["United Kingdom", "#876579"]];


var xScale;
var xAxis;
var xGrid;
var yScale;
var yAxis;
var yAxis2;
var yGrid;
var rightScale;
var rightAxis;
var rightGrid;
var rightScale2;
var rightAxis2;
var rightGrid2;
var chosenCountries = [];
var graphLines = [];
var graphPoints = [];
var countryFlags;
var countryNames;
var connectingPoints = [];
var connectingLines;
var parameter2Bars;
var newParameter2Bars;
var parameter3Bars;
var newParameter3Bars;

var logoYearFactor = 1.2;
var logoFactor = 1.2;
var logoSize = 5;
var leftLogoOpacity = 0.25;
var leftLineOpacity = 0.5;

var mainParameter = 1;
var secondParameter = 2;
var thirdParameter = 3;
var numberOfParameters = 3;
var numberOfCountries = 28;
var yMinFactor = 0.9;
var yMaxFactor = 1.1;
var autoMax = 100;

d3.select("body").attr("background", "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/background.jpg");

svg = d3.select("#content")
	.append("svg:svg")
	.attr("width", svgwidth)
	.attr("height",svgheight);

textsvg = d3.select("#textsvg")
	.append("svg:svg")
	.attr("width", svgwidth)
	.attr("height", 80);

$(function() {
	$("#yearslider").slider({
		orientation: "horizontal",
		range: "min",
	    step: 1,
	    range: true,
	    values: [minYear-yearsShown, minYear],
	    min: minYear-yearsShown,
	    max: maxYear,
	    change: refreshSlider
	});
	$( "input[type=submit]" ).button();
	$( "#radio" ).buttonset();
	$( "#currentyearspinner" ).spinner({
		min: minYear,
		max: maxYear,
		stop: function ( event, ui){
			var newval = $( "#currentyearspinner" ).spinner( "value");
	    	yearsShown = $( "#shownyearsspinner" ).spinner( "value");
	    	leftYear = newval - yearsShown;
	    	currentYearButtonPushed = true;
			$( "#yearslider" ).slider("values", 0, leftYear );
	    	currentYearButtonPushed = true;
			$( "#yearslider" ).slider("values", 1, newval );
		}
	});
	$( "#currentyearspinner" ).spinner( "value", minYear);
	$( "#shownyearsspinner" ).spinner({
	      min: 5,
	      max: 10,
	      stop: function (event, ui){
	    	  yearsShown = $( "#shownyearsspinner" ).spinner( "value");
	    	  leftYear = currentYear - yearsShown;
			  //mss binnen try-lus
	    	  try{    	  
	    		  $( "#yearslider" ).slider("values", 0, leftYear );
//	    		  changeSvg();
	    	  }
	    	  catch(err){
	    	  }
	      }
	});
	$( "#shownyearsspinner" ).spinner( "value", yearsShown);
	$( "#compspinner" ).spinner( {
	      min: minYear,
	      max: currentYear,
	      stop: function(event, ui){
	    	  resetComp = false;
	    	  compYear = $( "#compspinner" ).spinner( "value");
	    	  changeSvg();
	      }
	      });
	$( "#compspinner" ).spinner( "value", minYear);
	$( "#resetcomp").button();
	$( "#parameterbutton" ).button();
    $('#menu1').dropit();
	$( "#parameter2button" ).button();
    $('#menu2').dropit();
	$( "#parameter3button" ).button();
    $('#menu3').dropit();
});

function resetCompare(){
	resetComp = true;
	$( "#compspinner" ).spinner( "value",currentYear-1);
	compYear = currentYear - 1;
	changeSvg();
}

function refreshSlider(){
	console.log("Value: " + $("#yearslider").slider("value"));
	leftYear = $("#yearslider").slider("values", 0);
//	leftYear = currentYear-yearsShown;
	if(!playButtonPushed){
		currentYear = $("#yearslider").slider("values", 1);
		yearsShown = currentYear - leftYear;
	}
	rightYear = currentYear;
	$( "#currentyearspinner" ).spinner( "value", currentYear);
	$( "#compspinner" ).spinner( "option", "max", currentYear);
	if(currentYear >= minYear) $( "#shownyearsspinner" ).spinner( "option", "max", currentYear-minYear+yearsShown);
	else $( "#shownyearsspinner" ).spinner( "option", "max", yearsShown);
	$( "#shownyearsspinner" ).spinner( "value", rightYear-leftYear);		
	if(resetComp) {
		compYear = Math.max(minYear,currentYear - 1);
		$( "#compspinner" ).spinner( "value", compYear);
	}
	if(!playButtonPushed && !currentYearButtonPushed){
		psuedosvg.remove();
		visualizeSvg();		
	}
	else{
		changeSvg();		
	}
	currentYearButtonPushed = 0;
	playButtonPushed = 0;
}


function play(){
	if(!playing){
		playing = 1;
		$("#playpause").prop('value', 'Pause');
		addOneYear();
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');
	}
}

function addOneYear(){
	if(currentYear < maxYear){
		currentYear++;
//		$( "#currentyearspinner" ).spinner( "value", currentYear);
//		if(currentYear >= minYear + 10) $( "#shownyearsspinner" ).spinner( "option", "max", currentYear-minYear);
//		else $( "#shownyearsspinner" ).spinner( "option", "max", 10);
//		$( "#compspinner" ).spinner( "option", "max", currentYear);
//		if(resetComp) {
//			compYear = Math.max(minYear,currentYear - 1);
//			$( "#compspinner" ).spinner( "value", compYear);
//		}
		playButtonPushed = 1;
		$( "#yearslider" ).slider("values", 0, currentYear-yearsShown);//[currentYear-yearsShown, currentYear] );
		playButtonPushed = 1;
		$( "#yearslider" ).slider("values", 1, currentYear );
		if(playing){
			window.setTimeout(addOneYear,1000);
		}
	}
	else{
		playing = 0;
		$("#playpause").prop('value', 'Play');		
	}
}

start();

function start(){
	var ds = new Miso.Dataset({
		  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Data/' + dataName,
		  delimiter : ';'
	});
	
	ds.fetch({
		success : function() {
			console.log("Data loaded succesfully...");
			console.log("Available Columns:" + this.columnNames());
			console.log("There are " + this.length + " rows");
			data = [];
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
//	visualizeTextSvg();
	visualizeSvg();
}

function loadData(data){
	setCountries();
//	setCountriesData();
	console.log("Loaded!");
}

function setCountries(){
	for (var i =0; i < data.length; i++){
		if(data[i]["Type"] == "GDP"){
			var country = data[i]["Country"];
			var parameter1 = [];
			for(var j = minYear; j <= maxYear; j++){
				parameter1.push(data[i][j]);
			}
			var parameter2 = [];
			var parameter3 = [];
			var parameter4 = [];
			var parameter5 = [];
			var parameter6 = [];
			for (var k =0; k < data.length; k++){
				if(data[k]["Type"] == "Life expectancy at birth" && data[k]["Subtype"] == "Male" && data[k]["Country"] == country){
					for(var j = minYear; j <= maxYear; j++){
						parameter2.push(data[k][j]);
					}
				}
				if(data[k]["Type"] == "Unemployment Rate" && data[k]["Subtype"] == "Male 15+ yr" && data[k]["Country"] == country){
					for(var j = minYear; j <= maxYear; j++){
						parameter3.push(data[k][j]);
					}
				}	
				if(data[k]["Type"] == "Exit Age From Labour Force" && data[k]["Country"] == country){
					for(var j = minYear; j <= maxYear; j++){
						parameter4.push(data[k][j]);
					}
				}
				if(data[k]["Type"] == "Government Efficiency" && data[k]["Country"] == country){
					for(var j = minYear; j <= maxYear; j++){
						parameter5.push(data[k][j]);
					}
				}
				if(data[k]["Type"] == "Consumer Price Index" && data[k]["Country"] == country){
					for(var j = minYear; j <= maxYear; j++){
						parameter6.push(data[k][j]);
					}
				}
			}
			countries.push([country, parameter1, parameter2, parameter3,parameter4,parameter5,parameter6]);
		}
	}
}

function changeMainParameter(param){
	mainParameter = param;
//	if(secondParameter == mainParameter){
//		for(var i = 1; i <= numberOfParameters; i++){
//			if(mainParameter != i & thirdParameter != i){
//				secondParameter = i;
//				break;
//			}
//		}
//	}
//	if(thirdParameter == mainParameter){
//		for(var i = 1; i <= numberOfParameters; i++){
//			if(mainParameter != i & secondParameter != i){
//				thirdParameter = i;
//				break;
//			}
//		}
//	}
	changeMainParamterButton(param);
	psuedosvg.remove();
	visualizeSvg();
}

function changeSecondParameter(param){
	secondParameter = param;
	changeSecondParamterButton(param);
	psuedosvg.remove();
	visualizeSvg();
}

function changeThirdParameter(param){
	thirdParameter = param;
	changeThirdParamterButton(param);
	psuedosvg.remove();
	visualizeSvg();
}

function changeMainParamterButton(param){
	if(param == 1)	$("#parameterbutton span").text("Gross Domestic Product");
	if(param == 2)	$("#parameterbutton span").text("Life Expectancy");
	if(param == 3)	$("#parameterbutton span").text("Unemployment Rate");
	if(param == 4)	$("#parameterbutton span").text("Exit Age From Labour");
	if(param == 5)	$("#parameterbutton span").text("Government Efficiency");
	if(param == 6)	$("#parameterbutton span").text("Consumer Price Index");
}

function changeSecondParamterButton(param){
	if(param == 1)	$("#parameter2button span").text("Gross Domestic Product");
	if(param == 2)	$("#parameter2button span").text("Life Expectancy");
	if(param == 3)	$("#parameter2button span").text("Unemployment Rate");
	if(param == 4)	$("#parameter2button span").text("Exit Age From Labour");
	if(param == 5)	$("#parameter2button span").text("Government Efficiency");
	if(param == 6)	$("#parameter2button span").text("Consumer Price Index");
}

function changeThirdParamterButton(param){
	if(param == 1)	$("#parameter3button span").text("Gross Domestic Product");
	if(param == 2)	$("#parameter3button span").text("Life Expectancy");
	if(param == 3)	$("#parameter3button span").text("Unemployment Rate");
	if(param == 4)	$("#parameter3button span").text("Exit Age From Labour");
	if(param == 5)	$("#parameter3button span").text("Government Efficiency");
	if(param == 6)	$("#parameter3button span").text("Consumer Price Index");
}

function visualizeSvg(){
	psuedosvg = svg.append("svg:g");
	
	xScale = d3.scale.linear()
		.domain([leftYear, rightYear])
		.range([leftPadding, leftsvgwidth - rightPadding]);
	
//	var yMin = d3.min(countries, function(d){return Math.min.apply(Math,d[1])});
//	var yMax = d3.max(countries, function(d){return Math.max.apply(Math,d[1])});
//	var yMin = d3.min(countries, function(d){return Math.min(d[1])});
//	var yMax = d3.max(countries, function(d){return Math.max(d[1])});
	var yMin = d3.min(countries, function(d){return getArrayMin(d[mainParameter])});
	var yMax = d3.max(countries, function(d){return getArrayMax(d[mainParameter])});
			
	yScale = d3.scale.linear()
		.domain([yMin*yMinFactor, yMax*yMaxFactor])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(rightYear-leftYear);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
//	xAxis = psuedosvg.append("g")
//			.attr("class", "axis")
//			.attr("transform", "translate(0," + (svgheight - bottomPadding + 15) + ")")
//			.call(x_Axis);
	xGrid = psuedosvg.append("g")         
			.attr("transform", "translate(0," + (svgheight - bottomPadding) + ")")
		    .attr("class", "grid")
		    .call(makeXAxis()
		        .tickSize(-svgheight + topPadding + bottomPadding, 0, 0)
		        .tickFormat(d3.format("0"))
		    );

	function makeYAxis(){
		return d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(10);
	}
	var y_Axis = makeYAxis();
	yAxis = psuedosvg.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(" + (leftPadding-10) + "," + 0 +")")
			.call(y_Axis);
//	yAxis2 = psuedosvg.append("g")
//			.attr("class", "axis")
//			.attr("transform", "translate(" + (leftsvgwidth - rightPadding + 60) + "," + 0 +")")
//			.call(y_Axis);
	yGrid = psuedosvg.append("g")         
			.attr("transform", "translate(" + leftPadding + "," + 0 +")")
		    .attr("class", "grid")
		    .call(makeYAxis()
			    .tickSize(-leftsvgwidth + rightPadding + leftPadding, 0, 0)
			    .tickFormat("")
		    );
	
	var line = d3.svg.line()
		.x(function(d,i) { 
			return xScale(leftYear + i); 
		})
		.y(function(d) { 
			if(d == null) return yScale(yMin*yMinFactor);
			else return yScale(d); 
		});
	
	var linesDataset = [];
	var positionsDataset = [];
	for(var j = 0; j < countries.length; j++){
		var temp = []
		for(var i = leftYear; i <= rightYear; i++){
			temp.push(countries[j][mainParameter][i - minYear]);
			positionsDataset.push([j, i - minYear]);			
		}
		linesDataset.push([j, temp]);		
	}
	
	graphLines = psuedosvg.selectAll("path.line")
			.data(linesDataset)
			.enter()
			.append("svg:path")
			.attr("class", "line")
			.attr("d", function(d){
				return line(d[1]);
			})
			.attr("opacity", function(d){
				if(contains(chosenCountries, countries[d[0]][0])){
					return 1;
				}
		    	return leftLineOpacity;
			})
			.attr("stroke", function(d){
				return getColor(countries[d[0]][0]);
			})
			.attr("stroke-width", function(d){
				if(contains(chosenCountries, countries[d[0]][0])){
					return 4;
				}
				return 2;
			})
		    .on("mouseover", function(d){
		    	d3.select(this).attr("opacity", 1);
		    	graphPoints.attr("opacity", function(d2){
		    		if(countries[d2[0]][mainParameter][d2[1]] == null) return 0;
		    		if(d2[0] == d[0]) return 1;
		    		if(contains(chosenCountries, countries[d2[0]][0]) || (d2[1]==currentYear-minYear)) return 1;
		    		if(d2[1]==compYear-minYear) return 0.8;
		    		else return leftLogoOpacity;
		    	})
		    	connectingLines.attr("opacity", function(d2){
					if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
		    		if(d2[0] == countries[d[0]][0]) return 1;
		    		if(contains(chosenCountries, d2[0])) return 1;
		    		else return leftLineOpacity;
		    	})
		    	
		    })
		    .on("mouseout", function(d){
		    	if(contains(chosenCountries, countries[d[0]][0]) || contains(chosenCountries, "All")){
		    		d3.select(this).attr("opacity", 1);
		    	}
		    	else{
		    		d3.select(this).attr("opacity", leftLineOpacity);
		    	}
		    	graphPoints.attr("opacity", function(d2){
		    		if(countries[d2[0]][mainParameter][d2[1]] == null) return 0;
		    		if(contains(chosenCountries, countries[d2[0]][0]) || (d2[1]==currentYear-minYear)) return 1;
		    		if(d2[1]==compYear-minYear) return 0.8;
		    		else return leftLogoOpacity;
		    	})
		    	connectingLines.attr("opacity", function(d2){
					if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
		    		if(contains(chosenCountries, d2[0])) return 1;
		    		else return leftLineOpacity;
		    	})
		    })
		    .on("click", function(d){
		    	if(contains(chosenCountries, countries[d[0]][0])){
		    		deleteValue(chosenCountries, countries[d[0]][0]);
		    	}
		    	else{
		    		chosenCountries.push(countries[d[0]][0]);
		    	}
		    	changeSvg();
		    });
		
//	div = d3.select("#content2").append("div")   
//	    .attr("class", "tooltip")               
//	    .style("opacity", 0);

	graphPoints = psuedosvg.selectAll("image.points")
			.data(positionsDataset)
			.enter()
			.append("circle")
			.attr("fill",function(d){
				return getColor(countries[d[0]][0]);
			})
//			.append("image")
//			.attr("xlink:href", "http://www.student.kuleuven.be/~s0187958/Thesis/Data/Images/Arsenal.png")
			.attr("r", function(d){
				if(d[1]  + minYear == currentYear){
					return logoSize*logoFactor*logoYearFactor;
				}
				if(contains(chosenCountries, countries[d[0]][0])){
					return logoSize*logoFactor;
				}
				return logoSize;
			})
//			.attr("width", function(d){
//				if(d[1]  + minYear == currentYear){
//					return logoSize*logoFactor*logoYearFactor;
//				}
//				if(contains(chosenCountries, countries[d[0]][0])){
//					return logoSize*logoFactor;
//				}
//				return logoSize;
//			})
	        .attr("cx", function(d){
				if(d[1] + minYear == currentYear){
					return xScale(d[1] + minYear)/*-(logoSize/2)*logoFactor*logoYearFactor*/;
				}
				if(contains(chosenCountries, countries[d[0]][0])){
					return xScale(d[1] + minYear)/*-(logoSize/2)*logoFactor*/;
				}
	        	return xScale(d[1] + minYear)/*-(logoSize/2)*/;
	        })
	        .attr("cy", function(d){
	        	if(countries[d[0]][mainParameter][d[1]] == null) return yScale(yMin*yMinFactor);
				if(d[1]  + minYear == currentYear){
					return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*logoFactor*logoYearFactor*/;
				}
				if(contains(chosenCountries, countries[d[0]][0])){
					return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*logoFactor*/;
				}
	        	return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*/;
	        })
	        .attr("opacity", function(d) {
	    		if(countries[d[0]][mainParameter][d[1]] == null) return 0;
				if(contains(chosenCountries, countries[d[0]][0])  || (d[1]  + minYear ==currentYear)){
					return 1;
				}
	    		if(d[1]  + minYear == compYear) return 0.8;
				return leftLogoOpacity;
	        })
			.on("mouseover", function(d) { 
				graphLines.attr("opacity", function(d2, i2){
					if(d2[0] == d[0]) return 1;
					if(contains(chosenCountries, countries[d2[0]][0])) return 1;
					else return leftLineOpacity;
				});
				graphPoints.attr("opacity", function(d1){
		    		if(countries[d1[0]][mainParameter][d1[1]] == null) return 0;
					if(d1[0] == d[0]) return 1;
		    		if(contains(chosenCountries, countries[d1[0]][0]) || (d1[1] + minYear==currentYear)) return 1;
		    		if(d1[1] + minYear==compYear) return 0.8;
					else return leftLogoOpacity;
				});
//			        	if(contains(chosenCountries, countries[d[0]][0])){
//			        		var match = 0;
//	//		        		if(usedSeason == 0){
//	//		        			match = findMatch("2011-2012", d[1], countries[d[0]][0]);	
//	//		        		}
//	//		        		if(usedSeason == 1){
//	//		        			match = findMatch("2012-2013", d[1], countries[d[0]][0]);	
//	//		        		}
//		        			match = findMatch(seasons[usedSeason], d[1], countries[d[0]][0]);
//			        		var postion = getPosition(countries[d[0]][0], d[1]);
//			        		var points = countries[d[0]][1][d[1]][1];
//			        		var goalsMade = countries[d[0]][1][d[1]][3];
//			        		var goalsAgainst = countries[d[0]][1][d[1]][5];
//			        		var text = match.HomeTeam + " vs " + match.AwayTeam + " : " + match.FTHG + " - " + match.FTAG;
//			        		div.transition()        
//				        		.duration(200)      
//				        		.style("opacity", 0.9);      
//			        		div.html("<b><big><big>" + countries[d[0]][0] + "</big></big></b><br/>" + "<i>currentYear: </i>" + "<b>" + d[1] + "</b><br/><i>Number of points: </i>" + "<b>" + points + "</b><br/>" + "<i>Goals made: </i>" + "<b>" + goalsMade + "</b><br/>" + "<i>Goals against: </i>" + "<b>" + goalsAgainst + "</b><br/>" + "<small><i>Last match: </i></small>" + "<br/>" + "   " + "<big><b>" + text + "</big></b>")  
//				        		.style("left", (d3.event.pageX) + "px")     
//	//			        		.style("top", (d3.event.pageY - div.attr("height")) + "px");
//			        			.style("top", (d3.event.pageY - 125) + "px");				        		
//			        	}
		    	connectingLines.attr("opacity", function(d2){
					if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
		    		if(d2[0] == countries[d[0]][0]) return 1;
		    		if(contains(chosenCountries, d2[0])) return 1;
		    		else return leftLineOpacity;
		    	})
			})            
	        .on("mouseout", function(d) { 
	        	graphPoints.attr("opacity", function(d1){
		    		if(countries[d1[0]][mainParameter][d1[1]] == null) return 0;
		    		if(contains(chosenCountries, countries[d1[0]][0]) || (d1[1] + minYear==currentYear)) return 1;
		    		if(d1[1] + minYear==compYear) return 0.8;
		    		else return leftLogoOpacity;
	        	});
		    	graphLines.attr("opacity", function(d2, i2){
		    		if(contains(chosenCountries, countries[d2[0]][0])) return 1;
		    		else return leftLineOpacity;
		    	});
//			            div.transition()        
//			                .duration(500)      
//			                .style("opacity", 0); 

		    	connectingLines.attr("opacity", function(d2){
					if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
		    		if(contains(chosenCountries, d2[0])) return 1;
		    		else return leftLineOpacity;
		    	})
	        })
	        .on("click", function(d){
	        	if(contains(chosenCountries, countries[d[0]][0])){
	        		deleteValue(chosenCountries, countries[d[0]][0]);
	        	}
	        	else{
	        		chosenCountries.push(countries[d[0]][0]);
	        	}
	        	changeSvg();
	        });
	
	countryFlags = psuedosvg.selectAll("image.countryflags")
		.data(countries)
		.enter()
		.append("image")
		.attr("xlink:href", function(d){
			return getImage(d[0]);
		})
		.attr("height", function(d){
			return Math.abs(yScale(yMax*yMaxFactor)-yScale(yMin*yMinFactor))/(numberOfCountries-1) - 5;
		})
		.attr("width", function(d){
			return (Math.abs(yScale(yMax*yMaxFactor)-yScale(yMin*yMinFactor))/(numberOfCountries-1) - 5)*(5/3);
		})
		.attr("y", function(d,i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 15;
		})
		.attr("x", function(d) {
	        return leftsvgwidth - rightPadding + rightFlagPadding;
		})
		.on("mouseover", function(d) { 
			graphLines.attr("opacity", function(d2, i2){
				if(countries[d2[0]][0] == d[0]) return 1;
				if(contains(chosenCountries, countries[d2[0]][0])) return 1;
				else return leftLineOpacity;
			});
			graphPoints.attr("opacity", function(d1){
	    		if(countries[d1[0]][mainParameter][d1[1]] == null) return 0;
				if(countries[d1[0]][0] == d[0]) return 1;
	    		if(contains(chosenCountries, countries[d1[0]][0]) || (d1[1] + minYear==currentYear)) return 1;
	    		if(d1[1] + minYear==compYear) return 0.8;
				else return leftLogoOpacity;
			});
	    	connectingLines.attr("opacity", function(d2){
				if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
	    		if(d2[0] == d[0]) return 1;
	    		if(contains(chosenCountries, d2[0])) return 1;
	    		else return leftLineOpacity;
	    	});
		})
        .on("mouseout", function(d) { 
        	graphPoints.attr("opacity", function(d1){
	    		if(countries[d1[0]][mainParameter][d1[1]] == null) return 0;
	    		if(contains(chosenCountries, countries[d1[0]][0]) || (d1[1] + minYear==currentYear)) return 1;
	    		if(d1[1] + minYear==compYear) return 0.8;
	    		else return leftLogoOpacity;
        	});
	    	graphLines.attr("opacity", function(d2, i2){
	    		if(contains(chosenCountries, countries[d2[0]][0])) return 1;
	    		else return leftLineOpacity;
	    	});
	    	connectingLines.attr("opacity", function(d2){
				if(d2[1][0] == yScale(yMin*yMinFactor)) return 0;
	    		if(contains(chosenCountries, d2[0])) return 1;
	    		else return leftLineOpacity;
	    	});
        })
        .on("click", function(d){
        	if(contains(chosenCountries, d[0])){
        		deleteValue(chosenCountries, d[0]);
        	}
        	else{
        		chosenCountries.push(d[0]);
        	}
        	changeSvg();
        });
	
	var lineCountries = [];
	var firstPoints = [];
	var secondPoints = [];
	
	countryNames = psuedosvg.selectAll("text.names")
		.data(countries)
		.enter()
		.append("text")
		.text(function(d) {
			return d[0];
		})
		.attr("y", function(d,i) {
			lineCountries.push(d[0]);
			if(d[mainParameter][currentYear-minYear] == null){
				firstPoints.push(yScale(yMin*yMinFactor));
			}
			else {
				firstPoints.push(yScale(d[mainParameter][currentYear-minYear]));
			}
			secondPoints.push(yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor));
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor);
		})
		.attr("x", function(d) {
	        return leftsvgwidth - rightPadding + rightNamePadding;
		})
		.attr("fill", function(d){
			return getColor(d[0]);
		})
		.attr("font-family", "sans-serif")
		.attr("font-size", "12px")
		.attr("opacity", 0.9)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	connectingPoints = [];
	for(var i = 0; i < firstPoints.length; i++){
		connectingPoints.push([lineCountries[i],[firstPoints[i],secondPoints[i]]])
	}
	
	var connectingLine = d3.svg.line()
		.x(function(d,i) { 
			if(i == 0) return leftsvgwidth - rightPadding;
			if(i == 1) return leftsvgwidth - rightPadding + rightFlagPadding;
		})
		.y(function(d) { 
			return d; 
		});
	
	connectingLines = psuedosvg.selectAll("path.connect")
		.data(connectingPoints)
		.enter()
		.append("svg:path")
		.attr("class", "line")
		.attr("d", function(d){
			return connectingLine(d[1]);
		})
		.attr("opacity", function(d){
			if(d[1][0] == yScale(yMin*yMinFactor)) return 0;
			else return leftLineOpacity;
		})
		.attr("stroke", function(d){
			return getColor(d[0]);
		})
		.attr("stroke-width", 2)
	    .on("mouseover", function(d){
			if(d[1][0] == yScale(yMin*yMinFactor)) d3.select(this).attr("opacity", 0);
			else d3.select(this).attr("opacity", 1);
	    	graphPoints.attr("opacity", function(d2){
	    		if(countries[d2[0]][mainParameter][d2[1]] == null) return 0;
	    		if(countries[d2[0]][0] == d[0]) return 1;
	    		if(contains(chosenCountries, countries[d2[0]][0]) || (d2[1]==currentYear-minYear)) return 1;
	    		if(d2[1]==compYear-minYear) return 0.8;
	    		else return leftLogoOpacity;
	    	})
			graphLines.attr("opacity", function(d2, i2){
				if(countries[d2[0]][0] == d[0]) return 1;
				if(contains(chosenCountries, countries[d2[0]][0])) return 1;
				else return leftLineOpacity;
			});	    	
	    })
	    .on("mouseout", function(d){
	    	if(d[1][0] == yScale(yMin*yMinFactor)) d3.select(this).attr("opacity", 0);
			else if(contains(chosenCountries, d[0])){
	    		d3.select(this).attr("opacity", 1);
	    	}
	    	else{
	    		d3.select(this).attr("opacity", leftLineOpacity);
	    	}
	    	graphPoints.attr("opacity", function(d2){
	    		if(countries[d2[0]][mainParameter][d2[1]] == null) return 0;
	    		if(contains(chosenCountries, countries[d2[0]][0]) || (d2[1]==currentYear-minYear)) return 1;
	    		if(d2[1]==compYear-minYear) return 0.8;
	    		else return leftLogoOpacity;
	    	})
	    	graphLines.attr("opacity", function(d2, i2){
	    		if(contains(chosenCountries, countries[d2[0]][0])) return 1;
	    		else return leftLineOpacity;
	    	});
	    })
	    .on("click", function(d){
	    	if(contains(chosenCountries, d[0])){
	    		deleteValue(chosenCountries, d[0]);
	    	}
	    	else{
	    		chosenCountries.push(d[0]);
	    	}
	    	changeSvg();
	    });
	
	var rightMax1 = d3.max(countries, function(d){return getArrayMax(d[secondParameter])});
	var rightMax2 = d3.max(countries, function(d){return getArrayMax(d[thirdParameter])});
	
	rightScale = d3.scale.linear()
		.domain([0, rightMax1])
//		.domain([0, Math.max(rightMax1, rightMax2)])
		.range([0, barwidth]);
	
	function makeRightAxis(){
		return d3.svg.axis()
			.scale(rightScale)
			.orient("bottom")
			.ticks(8);  //Set rough # of ticks		
		}
	var right_Axis = makeRightAxis();
	rightAxis = psuedosvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftsvgwidth - rightPadding + rightGraphPadding) +","+ (yScale(yMin*yMinFactor) + 10)+")")
//		.attr("opacity", 0.5)
		.attr("font-weight", "bold")
		.attr("fill", "#4c8bff")
		.call(right_Axis);
	rightGrid = psuedosvg.append("g")         
		.attr("transform", "translate("+ (leftsvgwidth - rightPadding + rightGraphPadding) +","+ (yScale(yMin*yMinFactor) + 10)+")")
		.attr("class", "grid")
		.call(makeRightAxis()
		    .tickSize(-svgheight + bottomPadding + topPadding - 40, 0, 0)
		    .tickFormat("")
		);
	
	rightScale2 = d3.scale.linear()
		.domain([0, rightMax2])
	//	.domain([0, Math.max(rightMax1, rightMax2)])
		.range([0, barwidth]);
	
	function makeRightAxis2(){
		return d3.svg.axis()
			.scale(rightScale2)
			.orient("bottom")
			.ticks(10);  //Set rough # of ticks		
		}
	var right_Axis2 = makeRightAxis2();
	rightAxis2 = psuedosvg.append("g")
		.attr("class", "axis")
		.attr("transform", "translate("+ (leftsvgwidth - rightPadding + rightGraphPadding) +","+ (yScale(yMin*yMinFactor) + 30)+")")
//		.attr("opacity", 0.5)
		.attr("font-weight", "bold")
		.attr("fill","#646464")
		.call(right_Axis2);
//	rightGrid2 = psuedosvg.append("g")         
//		.attr("transform", "translate("+ (leftsvgwidth - rightPadding + rightGraphPadding) +","+ (yScale(yMin*yMinFactor) + 10)+")")
//		.attr("class", "grid")
//		.call(makeRightAxis()
//		    .tickSize(-svgheight + bottomPadding + topPadding - 40, 0, 0)
//		    .tickFormat("")
//		);
	
	
	psuedosvg.append("text")
		.text("Main parameter")
		.attr("x", xScale(leftYear))
		.attr("y", yScale(yMax*yMaxFactor) - 15)
		.attr("font-family", "sans-serif")
		.attr("font-size", "16px")
		.attr("fill", "#000000")
		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "middle");
	
	psuedosvg.append("text")
		.text("Second parameter")
		.attr("x", leftsvgwidth - rightPadding + rightGraphPadding)
		.attr("y", yScale(yMin*yMinFactor)+ 70)
		.attr("font-family", "sans-serif")
		.attr("font-size", "16px")
		.attr("fill", "#4c8bff")
//		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	psuedosvg.append("text")
		.text("Third parameter")
		.attr("x", leftsvgwidth - rightPadding + rightGraphPadding)
		.attr("y", yScale(yMin*yMinFactor)+87)
		.attr("font-family", "sans-serif")
		.attr("font-size", "16px")
		.attr("fill", "#646464")
//		.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	psuedosvg.append("text")
		.text("Lost")
		.attr("x", leftsvgwidth - rightPadding + rightGraphPadding + barwidth/2)
		.attr("y", yScale(yMin*yMinFactor)+ 70)
		.attr("font-family", "sans-serif")
		.attr("font-size", "16px")
		.attr("fill", "#008000")
	//	.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");

psuedosvg.append("text")
		.text("Gained")
		.attr("x", leftsvgwidth - rightPadding + rightGraphPadding + barwidth/2)
		.attr("y", yScale(yMin*yMinFactor)+87)
		.attr("font-family", "sans-serif")
		.attr("font-size", "16px")
		.attr("fill", "#cc3333")
	//	.attr("opacity", 0.75)
		.attr("font-weight", "bold")
		.attr("text-anchor", "left");
	
	parameter2Bars = psuedosvg.selectAll("rect.par2bar")
		.data(countries)
		.enter()
		.append("rect")
//		.attr("x", function(d, i) {
//	      	return leftsvgwidth - rightPadding + rightGraphPadding + Math.abs(rightScale(d[secondParameter][currentYear-minYear])-rightScale(d[secondParameter][Math.max(0,compYear-minYear)]));
//		})
//		.attr("y", function(d, i) {
//			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 10;
//		})
//		.attr("width", function(d) {
//			return rightScale(d[secondParameter][Math.max(0,compYear - minYear)]);	
//		})
		.attr("x", function(d, i) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return leftsvgwidth - rightPadding + rightGraphPadding + rightScale(Math.min(compPar, currPar));
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 10;
		})
		.attr("width", function(d) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.abs(compPar-currPar));
		})
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 1)
		.attr("opacity",0.85)
		.attr("height", 5)
		.attr("fill", function(d){
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			if(compPar > currPar) return "#cc3333";
			else return "#008000";
		});
	
	newParameter2Bars = psuedosvg.selectAll("rect.newpar2bar")
		.data(countries)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        return leftsvgwidth - rightPadding + rightGraphPadding;
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 10;
		})
//		.attr("width", function(d) {
//			return Math.abs(rightScale(d[secondParameter][currentYear-minYear]) - rightScale(d[1][Math.max(0,compYear-minYear)]));
//		})
		.attr("width", function(d) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.min(compPar, currPar));
		})
		.attr("stroke-width", 0)
		.attr("stroke-opacity", 1)
		.attr("opacity",0.85)
		.attr("height", 5)
		.attr("fill", "#4c8bff");
	
	parameter3Bars = psuedosvg.selectAll("rect.par3bar")
		.data(countries)
		.enter()
		.append("rect")
//		.attr("x", function(d, i) {
//	        return leftsvgwidth - rightPadding + rightGraphPadding + Math.abs(rightScale2(d[thirdParameter][currentYear-minYear])-rightScale2(d[thirdParameter][Math.max(0,compYear-minYear)]));
//		})
//		.attr("y", function(d, i) {
//			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 4;
//		})
//		.attr("width", function(d) {
//			return rightScale2(d[thirdParameter][Math.max(0,compYear-minYear)]);	
//		})
		.attr("x", function(d, i) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return leftsvgwidth - rightPadding + rightGraphPadding + rightScale(Math.min(compPar, currPar));
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 4;
		})
		.attr("width", function(d) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.abs(compPar-currPar));
		})
		.attr("opacity",0.85)
		.attr("height", 5)
		.attr("fill", function(d){
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			if(compPar > currPar) return "#cc3333";
			else return "#008000";
		});
	newParameter3Bars = psuedosvg.selectAll("rect.newpar3bar")
		.data(countries)
		.enter()
		.append("rect")
		.attr("x", function(d, i) {
	        return leftsvgwidth - rightPadding + rightGraphPadding;
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 4;
		})
//		.attr("width", function(d) {
//			return Math.abs(rightScale2(d[thirdParameter][currentYear-minYear]) - rightScale2(d[thirdParameter][Math.max(0,compYear-minYear)]));
//		})
		.attr("width", function(d) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.min(compPar, currPar));
		})
		.attr("opacity",85)
		.attr("height", 5)
		.attr("fill", "#646464");
	
	changeSvg();
	
}

function changeSvg(){
	xScale = d3.scale.linear()
		.domain([leftYear, rightYear])
		.range([leftPadding, leftsvgwidth - rightPadding]);

	var yMin = d3.min(countries, function(d){return getArrayMin(d[mainParameter])});
	var yMax = d3.max(countries, function(d){return getArrayMax(d[mainParameter])});
	
	yScale = d3.scale.linear()
		.domain([yMin*yMinFactor, yMax*yMaxFactor])
		.range([svgheight - bottomPadding, topPadding]);
	
	function makeXAxis(){
		return d3.svg.axis()
			.scale(xScale)
			.orient("bottom")
			.ticks(rightYear-leftYear);  //Set rough # of ticks
	}
	var x_Axis = makeXAxis();
	xGrid.call(makeXAxis()
	        .tickSize(-svgheight + topPadding + bottomPadding, 0, 0)
	        .tickFormat(d3.format("0"))
	    );
	
	function makeYAxis(){
		return d3.svg.axis()
			.scale(yScale)
			.orient("left")
			.ticks(10);
	}
	var y_Axis = makeYAxis();
	yAxis.call(y_Axis);
//	yAxis2.call(y_Axis);
	yGrid.call(makeYAxis()
		    .tickSize(-leftsvgwidth + rightPadding + leftPadding, 0, 0)
		    .tickFormat("")
	    );
		
	var line = d3.svg.line()
		.x(function(d,i) { 
//			return xScale(Math.max(leftYear,minYear) + i); 
			return xScale(leftYear + i); 
		})
		.y(function(d) { 
			if(d == null) return yScale(yMin*yMinFactor);
			else return yScale(d); 
		});
	
	var linesDataset = [];
	var positionsDataset = [];
	for(var j = 0; j < countries.length; j++){
		var temp = []
		for(var i = leftYear; i <= rightYear; i++){
			temp.push(countries[j][mainParameter][i - minYear]);
			positionsDataset.push([j, i - minYear]);			
		}
		linesDataset.push([j, temp]);		
	}
	
	graphLines.data(linesDataset)
		.enter();
	graphLines.transition()
		.duration(1000)
		.attr("d", function(d){
			return line(d[1]);
		})
		.attr("opacity", function(d){
			if(contains(chosenCountries, countries[d[0]][0])){
				return 1;
			}
	    	return leftLineOpacity;
		})
		.attr("stroke-width", function(d){
			if(contains(chosenCountries, countries[d[0]][0])){
				return 4;
			}
			return 2;
		});
	
	graphPoints.data(positionsDataset)
		.enter();
	graphPoints.transition()
		.duration(1000)
        .attr("cx", function(d){
			if(d[1]==currentYear - minYear){
				return xScale(d[1] + minYear)/*-(logoSize/2)*logoFactor*logoYearFactor*/;
			}
			if(contains(chosenCountries, countries[d[0]][0])){
				return xScale(d[1] + minYear)/*-(logoSize/2)*logoFactor*/;
			}
        	return xScale(d[1] + minYear)/*-(logoSize/2)*/;
        })
        .attr("cy", function(d){
        	if(countries[d[0]][mainParameter][d[1]] == null) return yScale(yMin*yMinFactor);
			if(d[1]  + minYear == currentYear){
				return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*logoFactor*logoYearFactor*/;
			}
			if(contains(chosenCountries, countries[d[0]][0])){
				return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*logoFactor*/;
			}
        	return yScale(countries[d[0]][mainParameter][d[1]])/*-(logoSize/2)*/;
        })
		.attr("r", function(d){
			if(d[1]==currentYear - minYear){
				return logoSize*logoFactor*logoYearFactor;
			}
			if(contains(chosenCountries, countries[d[0]][0])){
				return logoSize*logoFactor;
			}
			return logoSize;
		})
//		.attr("width", function(d){
//			if(d[1]==currentYear - minYear){
//				return logoSize*logoFactor*logoYearFactor;
//			}
//			if(contains(chosenCountries, countries[d[0]][0])){
//				return logoSize*logoFactor;
//			}
//			return logoSize;
//		})
        .attr("opacity", function(d){
    		if(countries[d[0]][mainParameter][d[1]] == null) return 0;
			if(contains(chosenCountries, countries[d[0]][0]) || (d[1]==currentYear - minYear)){
				return 1;
			}
    		if(d[1]==compYear - minYear) return 0.8;
			return leftLogoOpacity;
        });	
	
	countryNamePositions = [];
	
	var lineCountries = [];
	var firstPoints = [];
	var secondPoints = [];
	
	sortData();
	
	countryFlags.transition() 
		.duration(1000)
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 15;
		});
	
	countryNames.transition()          
		.duration(1000)
		.attr("y", function(d, i) {
			lineCountries.push(d[0]);
			if(d[mainParameter][currentYear-minYear] == null) {
				firstPoints.push(yScale(yMin*yMinFactor));
			}
			else {
				var firstPoint = yScale(d[mainParameter][currentYear-minYear]);
				firstPoints.push(firstPoint);
			}
			secondPoints.push(yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor));
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor);
//			if(d[1][currentYear-minYear]) return yScale(yMin*yMinFactor);
//			else return yScale(d[1][currentYear-minYear]) + 6;
		})
		.attr("opacity", function(d){
			if(contains(chosenCountries, d[0])){
				return 1;
			}
			else{
				return 0.9;
			}
		})
		.attr("font-size", function(d){
			if(contains(chosenCountries, d[0])){
				return "14px";
			}
			else{
				return "12px";
			}
		});
//		.attr("fill", function(d){
//			if(contains(chosenCountries, d[0])){
//				return "red";
//			}
//			else{
//				return "black";
//			}
//		});
	
	connectingPoints = [];
	for(var i = 0; i < firstPoints.length; i++){
		connectingPoints.push([lineCountries[i],[firstPoints[i],secondPoints[i]]]);
	}
	
	var connectingLine = d3.svg.line()
		.x(function(d,i) { 
			if(i == 0) return leftsvgwidth - rightPadding;
			if(i == 1) return leftsvgwidth - rightPadding + rightFlagPadding;
		})
		.y(function(d) { 
			return d; 
		});
	
	connectingLines.data(connectingPoints)
		.enter();
	connectingLines.transition()
		.duration(1000)
		.attr("d", function(d){
			return connectingLine(d[1]);
		})
		.attr("opacity", function(d){
			if(d[1][0] == yScale(yMin*yMinFactor)) return 0;
			if(contains(chosenCountries, d[0])) return 1;
			else return leftLineOpacity;
		})
		.attr("stroke", function(d){
			return getColor(d[0]);
		})
		.attr("stroke-width", function(d){
			if(contains(chosenCountries, d[0])){
				return 3;
			}
			else{
				return 2;
			}
		});
//		.attr("fill", function(d){
//			if(contains(chosenCountries, d[0])){
//				return "red";
//			}
//			else{
//				return "black";
//			}
//		});
	
	parameter2Bars.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return leftsvgwidth - rightPadding + rightGraphPadding + rightScale(Math.min(compPar, currPar));
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 10;
		})
		.attr("width", function(d) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.abs(compPar-currPar));
		})
		.attr("fill", function(d){
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			if(compPar > currPar) return "#cc3333";
			else return "#008000";
		});
	newParameter2Bars.transition()           
		.duration(1000)
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 10;
		})
		.attr("width", function(d) {
			var compPar = d[secondParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[secondParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.min(compPar, currPar));
		});
	parameter3Bars.transition()           
		.duration(1000)
		.attr("x", function(d, i) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return leftsvgwidth - rightPadding + rightGraphPadding + rightScale(Math.min(compPar, currPar));
		})
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 4;
		})
		.attr("width", function(d) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.abs(compPar-currPar));
		})
		.attr("fill", function(d){
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			if(compPar > currPar) return "#cc3333";
			else return "#008000";
		});
	newParameter3Bars.transition()           
		.duration(1000)
		.attr("y", function(d, i) {
			return yScale((yMax*yMaxFactor-yMin*yMinFactor)/(numberOfCountries-1)*i+yMin*yMinFactor) - 4;
		})
		.attr("width", function(d) {
			var compPar = d[thirdParameter][compYear-minYear];
			if(compPar == null) compPar = 0;
			var currPar = d[thirdParameter][currentYear-minYear];
			if(currPar == null) currPar = 0;
			return rightScale(Math.min(compPar, currPar));
		});
	
}

function getArrayMin(array){
	var min = 99999999;
//	for(var i = leftYear - minYear; i <= rightYear - minYear; i++){
	for(var i = 0; i <= maxYear - minYear; i++){
		if(array[i] != null && array[i] < min){
			min = array[i];
		}
	}
	return min;
}

function getArrayMax(array){
	var max = 0;
//	for(var i = leftYear - minYear; i <= rightYear - minYear; i++){
	for(var i = 0; i <= maxYear - minYear; i++){
		if(array[i] != null && array[i] > max){
			max = array[i];
		}
	}
	return max;
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

function findPosition(yValue){
	var value = yValue;
	for(var i = 0; i < countryNamePositions.length; i++){
		if(yValue > countryNamePositions[i] - 15 && yValue < countryNamePositions[i] + 15){
			if(yValue < countryNamePositions[i]) value = findPosition(yValue - 15);
			else value = findPosition(yValue + 15);
		}
	}
	countryNamePositions.push(value);
	return value;
}

function compareData(data1,data2){
	if (data1[mainParameter][currentYear-minYear] > data2[mainParameter][currentYear-minYear]) return 1;
	if (data1[mainParameter][currentYear-minYear] < data2[mainParameter][currentYear-minYear]) return -1;
	if(data1[0] > data2[0]) return -1;
	else return 1;
	
//	if (data1[mainParameter][currentYear-minYear] == null && data2[mainParameter][currentYear-minYear] == null) return data1[0] < data2[0];
//	if (data1[mainParameter][currentYear-minYear] == null) return -1;
//	if (data2[mainParameter][currentYear-minYear] == null) return 1;
//    else return -1;
}

function sortData(){
	countryFlags.sort(compareData).order();
	countryNames.sort(compareData).order();
	parameter2Bars.sort(compareData).order();
	newParameter2Bars.sort(compareData).order();
	parameter3Bars.sort(compareData).order();
	newParameter3Bars.sort(compareData).order();
}

function getColor(country){
	var color = "";
	for(var i = 0; i < countryColors.length; i++){
		if(countryColors[i][0] == country) return countryColors[i][1];
	}
	return color;
}

function getImage(country){
	var result = "http://www.student.kuleuven.be/~s0187958/Thesis/Data/CountryImages/" + country + ".png";
	return result;
}
