d3.text("display.txt").then(function(text) {

var cells=text.split("\n").map(function(el){
   return el.split("|");
    
});

var headings=cells.shift();

var obj=cells.map(function(el){
    
    var obj={};
    
    for (var i = 0, l = el.length; i < l; i++) {
    
        obj[headings[i]] = isNaN(Number(el[i])) ? el[i] : +el[i];
    }
    return obj;
});

var json=JSON.stringify(obj);
console.log(obj);
});

