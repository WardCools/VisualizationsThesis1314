        var w = 1000;
        var h = 500;
        var axis = 30;
        var startx = 10;
        var padding = 10;

        //Inladen data van google docs
          
        var ds = new Miso.Dataset({
			importer: Miso.Dataset.Importers.GoogleSpreadsheet,
			parser: Miso.Dataset.Parsers.GoogleSpreadsheet,
			key: "0Aqr5xrECBZEfdDh5YjJ6NjBQRUFJOU9hSDNLb0NaeVE",
			worksheet: "1"
		});
		ds.fetch({
			success : function() {
				console.log("Data loaded succesfully...");
				var data = [];
				this.each(function(row) {
					data.push(row);
				});
				visualize(data, ds);
				
			}
		});
		
		var avgHeight;
		var avgWeight;
		var avgShoeSize;
		
		
		function visualize(data, ds) {
        	
        	avgHeight = averageHeight(data);
        	avgWeight = averageWeight(data);
        	avgShoeSize = averageShoeSize(data);
        	
			var svg = d3.select("body")
						.append("svg")
						.attr("width", w+axis+startx)
						.attr("height", h + 5)
						.style("margin-top", "100px");
        	
        	var rects = svg.selectAll("rect")
        				.data(data)
        				.enter()
        				.append("rect");
        	
        	drawRects(rects,data);
        		 
        	showHeight();
        		 
        	//rects.append("title")
        		 //.text(function(d){return d["naam"] + " (" + d["hoogte (cm)"] + " cm)"});
        		 
        	rects.attr("id", function(d) { return d["_id"]; });
        	rects.attr("opacity", "1");
        	
		var opacity = "0.8";
        	var tip = d3.tip()
  					.attr('class', 'd3-tip')
  					.offset([-10, 0])
  					.html(function(d) {
  						var tiptext = "<span style='color:" + callColor(d) + ";'><center>" + d["naam"] + "</center></span>";
  						tiptext += "<span style='color: #d4d4d4;'>Hoogte: </span>" + d["hoogte (cm)"] + " cm" + "<br>";
  						tiptext += "<span style='color: #d4d4d4;'>BMI: </span>" + getBMI(d).toFixed(2) + "<br>";
  						tiptext += "<span style='color: #d4d4d4;'>Schoenmaat: </span>" + d["schoenmaat"];
    					return tiptext;
  					});
  		
  			svg.call(tip);
        	
        	rects.on("mouseenter", function(){
		        rects.transition().attr("opacity", opacity);
    			d3.select(this).transition().attr("opacity", "1").duration(0);
  			});
  			rects.on("mouseover", tip.show);
  			rects.on("mouseleave", function(d){
    			rects.transition().attr("opacity", "1").duration(200);
  			});
  			rects.on("mouseout", tip.hide);
  			
        	svg.append("g")
        		.attr("class", "shoeline");
        		
        	var lines = svg.selectAll(".shoeline").selectAll("line")
        				.data(data)
        				.enter()
        				.append("line");
        				
        	lines.attr("x1", function(d, i){return i*(w/data.length) + axis + startx;})
        		 .attr("x2", function(d, i){return ((i+1)*(w/data.length))-padding + startx + axis;})
        		 .attr("y1", function(d){return h - ((d["schoenmaat"])/1.5)/ds.max("hoogte (cm)")*h;})
        		 .attr("y2", function(d){return h - ((d["schoenmaat"])/1.5)/ds.max("hoogte (cm)")*h;})
        		 .attr("stroke-width", 2)
        		 .attr("stroke", "white");
        		
        	lines.append("title")
        		 .text(function(d){return "Schoenmaat: " + d["schoenmaat"]});
        		 
        	var avg_line = svg.append("line")
        					.attr("id", "avgLine");
        	
        	avg_line.attr("x1",axis)
        			.attr("x2",w + axis + startx - padding)
        			.attr("stroke-width", 2)
        		 	.attr("stroke", "black")
        		 	.attr("stroke-dasharray", "9");
        		 	
        	avg_line.append("title")
        		 .text("gemiddelde waarde: " + d3.round(avgHeight));
        		 	
        	avgLine(avgHeight, ds.max("hoogte (cm)"));
        		 
        	        		
        	var yScale = d3.scale.linear()
        						 .domain([0, ds.max("hoogte (cm)")])
        						 .range([h, 0]);
        	
        	var yAxis = d3.svg.axis()
        					  .scale(yScale)
        					  .orient("left")
        					  .ticks(20);
        	svg.append("g")
        	   .attr("class", "axis")
        	   .attr("transform", "translate(" + axis + ", 0)")
        	   .call(yAxis);
        	
		}
		
		function hideShoeLines(){
			d3.select("svg").selectAll(".shoeline").selectAll("line")
							.attr("stroke-width", 0);
		}
		
		function showShoeLines(){
			d3.select("svg").selectAll(".shoeline").selectAll("line")
							.attr("stroke-width", 2);
		}
		
		function avgLine(avg, max){
			d3.select("svg").transition().select("#avgLine")
				.attr("y1",h-(avg/max)*h)
				.attr("y2",h-(avg/max)*h)
		                .duration(500)
				.select("title")
				.text("gemiddelde waarde: " + d3.round(avg));
			        
				
		}
        
        function updateAxis(max){
        
        	d3.select("svg").selectAll(".axis")
        	   .remove();
        	   
        	var yScale = d3.scale.linear()
        						 .domain([0, max])
        						 .range([h, 0]);
        	
        	var yAxis = d3.svg.axis()
        					  .scale(yScale)
        					  .orient("left")
        					  .ticks(20);
        					  
        	d3.select("svg").append("g")
        	   .attr("class", "axis")
        	   .attr("transform", "translate(" + axis + ", 0)")
        	   .call(yAxis);
        }
        
        function callColor(obj){
	       	var bmi = getBMI(obj);
        	
        	if(bmi < 18.5) return "#006699";
        	if(bmi > 25 && bmi < 30) return "#990000";
        	if(bmi > 30) return "black";
        	return "green";
        }
        
        function averageRelativeShoeSize(data){
        	var cumul = 0;
        	var count = 0;
			console.log(data);
        	for(var i = 0; i < data.length; i++){
        		if(data[i]["hoogte (cm)"] != null) cumul += data[i]["schoenmaat"]/data[i]["hoogte (cm)"];
        		else count++;
        	}
        	
        	return cumul/(data.length-count);
        }
        
        function averageHeight(data) {
        	var cumul = 0;
        	for(var i = 0; i < data.length; i++){
        		cumul += data[i]["hoogte (cm)"];
        	}
        	return cumul/data.length;
        }
        
        function averageWeight(data) {
        	var cumul = 0;
        	for(var i = 0; i < data.length; i++){
        		cumul += data[i]["gewicht"];
        	}
        	return cumul/data.length;
        }
        
        function averageShoeSize(data) {
        	var cumul = 0;
        	for(var i = 0; i < data.length; i++){
        		cumul += data[i]["schoenmaat"];
        	}
        	return cumul/data.length;
        }
        
        function getBMI(obj) {
        	var hoogteSquared = obj["hoogte (cm)"]/100;
        	hoogteSquared *= hoogteSquared;
        	
        	var bmi = obj["gewicht"]/hoogteSquared;
        	return bmi; 
        }

        var viewProperty = "hoogte (cm)";
        
        function showWeight(){
        	var rects = d3.select("svg").transition().selectAll("rect");
	         d3.selectAll("button").attr("style","float:left;");
	        d3.select("#weight").attr("style","font-weight:bold; float:left;");
        	viewProperty = "gewicht";
        	rects.attr("height", function(d){return (d["gewicht"]/ds.max("gewicht"))*h;})
        		 .attr("y", function(d){return h-(d["gewicht"]/ds.max("gewicht"))*h;}).duration(500);
        	
        	updateAxis(ds.max("gewicht"));
        	
        	avgLine(avgWeight, ds.max("gewicht"));
        	hideShoeLines();
        }
        
        function showHeight(){
        	var rects = d3.select("svg").transition().selectAll("rect");
	        d3.selectAll("button").attr("style","float:left;");
	        d3.select("#height").attr("style","font-weight:bold; float:left;");
        	viewProperty = "hoogte (cm)";
        	rects.attr("height", function(d){return (d["hoogte (cm)"]/ds.max("hoogte (cm)"))*h;})
        		 .attr("y", function(d){return h-(d["hoogte (cm)"]/ds.max("hoogte (cm)"))*h;}).duration(500);
        		 
        	updateAxis(ds.max("hoogte (cm)"));	 
        	avgLine(avgHeight, ds.max("hoogte (cm)"));
        	showShoeLines();
        }
        
        function showShoeSize(){
        	var rects = d3.select("svg").transition().selectAll("rect");
	         d3.selectAll("button").attr("style","float:left;");
	        d3.select("#shoe-size").attr("style","font-weight:bold; float:left;");
        	viewProperty = "schoenmaat";
        	rects.attr("height", function(d){return (d["schoenmaat"]/ds.max("schoenmaat"))*h;})
        		 .attr("y", function(d){return h-(d["schoenmaat"]/ds.max("schoenmaat"))*h;}).duration(500);
        		 
        	updateAxis(ds.max("schoenmaat"));
        	avgLine(avgShoeSize, ds.max("schoenmaat"));
        	hideShoeLines();
        }

        function drawRects(rects,data){
	   // rects.attr("width", function(d){return (w/data.length) - padding;})
           //		 .attr("x", function(d, i){return i*(w/data.length) + axis + startx;})
           		 
	    rects.attr("fill", function(d){return callColor(d)});//function call moet zo.
	    updateRectsPosition(rects,data);
        		 //vraag maar aan Tom
	}
        
        function updateRectsPosition(rects){
	    var data = d3.select("svg").selectAll("rect").data();
	    rects.transition().attr("width", function(d){
		return (w/data.length) - padding;})
        		 .attr("x", function(d, i){return calcX(d,i,data);}).duration(500);
	}

        
        function calcX(d,i,data){
	     return i*(w/data.length) + axis + startx;
	    }

        function compareData(data1,data2){
	    if (data1[viewProperty] > data2[viewProperty]) return 1;
	    if (data1[viewProperty] == data2[viewProperty]) return 0;
	    return -1;
	}

        function sortData(){
	    var rects = d3.select("svg").selectAll("rect");
	    rects.sort(compareData).order();
	    updateRectsPosition(rects);
	}



        
        
        
