
(function(){
var origins=[];
    
  d3.queue()
    .defer(function(url, callback) {
        d3.text(url, function(error, d) {
            console.log("txt");
             var cells=d.split("\n").map(function(el){
             return el.split("|");
        });
        var headings=cells.shift(); //removed the first element from an array and returns that removed element.
        var obj=cells.map(function(el){
            var obj={};
        for(var i=0,l=el.length;i<l;i++){
          
             obj[headings[i]] = isNaN(Number(el[i])) ? el[i] : +el[i];
        }    
       
            return (obj);
        });
        
        JSON.stringify(obj);
            
            
       callback(error, obj);
        })
    }, "data/display.txt")
    
    
    .defer(d3.json,"data/parms.json")

    .awaitAll(loadData);

function loadData(error, data) {
    
  if(error) throw error;

var topTenData=data[0].sort(function(a,b){
    return d3.descending(+a.recommended_weekly_spend+b.recommended_weekly_spend);
}).slice(0, 10);

var parmJson=data[1];
console.log(parmJson[0].Campaign_Goal);

var maxVal = d3.max(topTenData, function (d) { return d.max_x_val; });
topTenData.forEach(function(ds,i){
    
    var lineData=d3.range(0,maxVal,100)
        .map(x => [x, (ds.alpha * (1 - Math.pow(2.71828, (-ds.beta * x))))]);
    var arr=[];
   
    for(var i=0;i<lineData.length;i++)
    {
        arr.push({
            x:lineData[i][0],
            y:lineData[i][1]
        });
 
    }
    ds.arr=arr;
    
});

buildLine(topTenData,parmJson);

function buildLine(data,data2){


var margin = {top: 40, right: 40, bottom: 40, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;   

var xScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) { return d.max_x_val; })])
    .range([0, width]);
 
var yScale = d3.scaleLinear()
    .domain([0, d3.max(data, function (d) {return d.max_y_val;})])
    .range([height, 0]);
	
var xAxisG =d3.axisBottom(xScale).tickSize(-height);	

var yAxisG = d3.axisLeft(yScale).tickSize(width);

var color = d3.scaleOrdinal(d3.schemeCategory10);
 
var zoom = d3.zoom()
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .scaleExtent([1, 10])
    .on("zoom", zoomed);
  
var svg = d3.select("#graph-body").append("svg") //chart
	.call(zoom)
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 20]) //top, left
        .html(function (d, i) {
            i++;
            return "<div class='tip-legend'><strong>Weekly Recommended Spend:</strong> <span class='d3span' style='color:red'>$" +
                d.recommended_weekly_spend + "</span> </br><strong>Placement ID:" + "</strong> <span class='d3span' style='color:red'>" +
                d.Placement_ID + "</span> </br><strong>Placement Name:</strong> <span class='d3span' style='color:red'>" +
                d.placement_name + "</span></div>";
        })
    svg.call(tip);



var gX = svg.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxisG)
    // .attr('clip-path','url(#x-clip-path)');
//text label for the x axis    
svg.append("text")
    .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top - 10) + ")")
    .style("text-anchor", "middle")
    .attr("class","title")
      .text("Spend");  

var gY = svg.append("g")
    .attr("class", "axis axis--y")
    .attr("transform", "translate(" + width + ",0)")
    .call(yAxisG);     

//text label for the y axis
svg.append("text")
      .data(data2)
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "end")
      .attr("class","title")
      .text((d,i)=>(d.Campaign_Goal))

    
var linesGroup=svg.append("g");
linesGroup.attr('clip-path','url(#my-clip-path)');
var mSvg=d3.select("svg");

var defs=mSvg.append('defs');

//Append a clipPath element to the defs element, and a Shape
// to define the cliping area
defs.append("clipPath").attr('id','my-clip-path').append('rect')
    .attr('width',width) //Set the width of the clipping area
    .attr('height',height); // set the height of the clipping area

//clip path for x axis
defs.append("clipPath").attr('id','x-clip-path').append('rect')
    .attr('width',width) //Set the width of the clipping area
    .attr('height',height + margin.bottom); // set the height of the clipping area



//text title for the whole graph 
svg.append("text").attr("transform","translate(" + (width/2) + " ," + (margin.top-60) + ")")
    .data(data2)
    .style("text-anchor", "middle")
    .attr("class","big-title")
    .text((d,i)=>("Top Ten Response Curves for "+d.Campaign_Goal));  
    
  //define the lines 
var valueline=d3.line()
    .x(function(d){return xScale(d.x)})
    .y(function(d){return yScale(d.y)});
    
var wsf = linesGroup.selectAll(".wsf")
        .data(data)
        .enter().append("g")
        .append("path")
        .attr("class","line")
        .attr('d', d => valueline(d.arr))
        .style('stroke',(d,i)=>color(i+d))
        .call(zoom)
        .attr("id",(d,i)=>('tag'+d.Placement_ID.toString().replace(/(?=[() ])/g, '')));
                          

//spent points 
//'#tag' + data.placement_name.toString().replace(/(?=[() ])/g, '')

var dots=wsf.select("dot")
        .data(data)
        .enter().append('circle')
        .attr("class", "circle")
        .attr("r", 3)
        .attr("cx", function (d) { return xScale(d.recommended_weekly_spend); })
        .attr("cy", function (d) { return yScale(d.alpha * (1 - Math.pow(2.71828, (-d.beta * d.recommended_weekly_spend)))); })
        .attr("fill", function (d, i) { return d.color = color(i + d.placement_name); })
        .attr("id",(d,i)=>('tag'+d.Placement_ID.toString().replace(/(?=[() ])/g, '')))
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);;

d3.select("button")
    .on("click", resetted);


function zoomed(){
    //create new scale objects based on event 
    var new_xScale=d3.event.transform.rescaleX(xScale);
    var new_yScale=d3.event.transform.rescaleY(yScale);
    gX.call(xAxisG.scale(new_xScale));
    gY.call(yAxisG.scale(new_yScale));
    wsf.attr("transform", d3.event.transform)
    dots.attr("transform", d3.event.transform)

}

 function resetted() {
   svg.transition()
      .duration(750)
       .call(zoom.transform, d3.zoomIdentity);
    }     
      
} //buildLine function chart ends here


};



    
})();




