var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 1680 - margin.left - margin.right,
    height = 680 - margin.top - margin.bottom;


var y = d3.scale.ordinal()
    .domain(d3.range(5))
    .rangePoints([0, height]);

var dataset = [
                  [ 1,1,0,3,1,0,3,1 ],
                  [ 3,3,3,1,0,0,0,1 ],
                  [ 3,1,3,3,3,3,0,3 ],
                  [ 3,1,3,0,1,3,1,3 ],
                  [ 1,1,3,0,3,1,0,3 ],
              ];



    


	/*

var ds = new Miso.Dataset({
	  url : 'http://www.student.kuleuven.be/~s0187958/Thesis/Data/E0_1314.csv',
	  delimiter : ','
	});

	ds.fetch({
	  success : function() {
	    console.log("Available Columns:" + this.columnNames());
	    console.log("There are " + this.length + " rows");
	  }
	});

var datasize = dataset[0].length;

var loadeddata;


window.onload = function()
{
	d3.text("E0_1314.csv", function(unparsedData){
//			var data = d3.csv.parseRows(unparsedData);
			setLoadedData(unparsedData);
		});
};

//d3.csv("E0_1314.csv", function(data) {
//	setLoadedData(data)
//});

function setLoadedData(data) {
	loadeddata = data;
	console.log(loadeddata[0].length);
};

*/

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var circles = svg.selectAll("circle")
                .data(dataset)
                .enter()
                .append("circle")
                .attr("r", 25)
                .attr("cx", 900)
                .attr("cy", function(d, i) {
                        return (i * 75) + 25;
                    });
                /*.each( function (d) {
                        /*var points = 0;
                        for (var i = 0; i < d.length; i++) {
                           points += d[i]
                           //move(points)
                           d3.select(this)
                             .transition()
                             .delay(1000)
                             .duration(1000)
                             .attr("cx", points * 40)
                             }
                             animateFirstStep();
                        });*/

//animateFirstStep();

circles.on('click', function() {    
    counter ++;
    circles.data(dataset)
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("cx", function(d) { 
                var points = 0;
                for (var i = 0; i < counter; i++) {
                    points += d[i]
                }
                return points* 40;
             });

});

/*circles.on('click',function (d) {
   var points = 0;
                        for (var i = 0; i < d.length; i++) {
                           points += d[i]
                           //move(points)
                           d3.select(this)
                             .transition()
                             .delay(1000)
                             .duration(1000)
                             .attr("cx", points * 40)
                             }
                             circles.each(animateFirstStep(d, 0))
                        });*/

function animateFirstStep(){
    counter++;
    if(counter < datasize) {
    circles.data(dataset)
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("cx", function(d) { 
                var points = 0;
                for (var i = 0; i < counter; i++) {
                    points += d[i]
                }
                return points* 40;
             });
            //.each("end", animateFirstStep());
    }
    animateFirstStep();
};

function animateSecondStep(d,n){
    counter++;
    if(counter < datasize) {
    circles.data(dataset)
            .transition()
            .delay(1000)
            .duration(1000)
            .attr("cx", function(d) { 
                var points = 0;
                for (var i = 0; i < counter; i++) {
                    points += d[i]
                }
                return points* 40;
             })
            .each("end", animateFirstStep());
    }
};
                     
/*
function move(d) {
   d3.select(this)
      .transition()
      .delay(1000)
      .duration(1000)
      .attr("cx", d * 40)
};*/