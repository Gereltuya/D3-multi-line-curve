
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
    }, "display.txt")
    .defer(d3.json,"parms.json")

    .awaitAll(buildLine);

function buildLine(error, data) {
    
  if(error) throw error;
 

 
data[0].forEach(function(d){

});


var topTenData=data[0].sort(function(a,b){
    return d3.descending(+a.recommended_weekly_spend+b.recommended_weekly_spend);
}).slice(0, 10);

var maxVal = d3.max(topTenData, function (d) { return d.max_x_val; });

console.log(maxVal);

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
    console.log(topTenData);
     
        
})

}
    
})();




