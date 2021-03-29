// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 100, bottom: 40, left: 175};

const TOP_NUM = 10;

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH / 2) - 10, graph_1_height = 250;
let graph_2_width = (MAX_WIDTH / 2) - 10, graph_2_height = 275;
let graph_3_width = MAX_WIDTH / 2, graph_3_height = 575;

var radius = Math.min(graph_2_width, graph_2_height) / 2;
var leg_rect_size = 20;
var leg_space = 5;

var data_total = [];
var data_na = [];
var data_eu = [];
var data_jp = [];
var data_other = [];

var data_action =[];

var svg = d3.select("#graph1")
    .append("svg")
    .attr("width", graph_1_width + margin.left + margin.right)
    .attr("height", graph_1_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`); 

let countRef = svg.append("g"); 

var svg2 = d3.select("#graph2")
    .append("svg")
    .attr("width", graph_2_width + margin.left + margin.right)
    .attr("height", graph_2_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${(graph_2_width)/2}, ${(graph_2_height + margin.top + margin.bottom)/2})`);

var tooltip = d3.select("#graph2")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


var bt_na = d3.select("button#NA")
    .on("click", function(){set_tooltip(data_na); change(data_na);})
var bt_eu = d3.select("button#EU")
    .on("click", function(){set_tooltip(data_eu); change(data_eu);})
var bt_jp = d3.select("button#JP")
    .on("click", function(){set_tooltip(data_jp); change(data_jp);})
var bt_other = d3.select("button#Other")
    .on("click", function(){set_tooltip(data_other); change(data_other);})
var bt_total = d3.select("button#Total")
    .on("click", function(){set_tooltip(data_total); change(data_total);})

var svg3 = d3.select("#graph3")
    .append("svg")
    .attr("width", graph_3_width + margin.left + margin.right)
    .attr("height", graph_3_height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left+50}, ${margin.top})`);

var button_op = ["Action", "Adventure", "Fighting", "Misc", "Platform", "Puzzle", "Racing","Role-Playing", "Shooter", "Simulation", "Sports", "Strategy"];
d3.select("#select_bt")
    .selectAll("myOptions")
    .data(button_op)
    .enter()
    .append("option")
    .text(function(d){return d;})
    .attr("value", function (d) { return d;})

d3.select("#select_bt").on("change",function(d){
    var option = d3.select(this).property("value")
    bar_plot_update(option)
})

//use the video_games data set
d3.csv("../data/video_games.csv").then(function(data){

    //clean data 
    data1 = cleanData(data, function(a,b){return b.Global_Sales - a.Global_Sales;}, TOP_NUM);

    var y = d3.scaleBand()
        .range([0, graph_1_height - margin.top- margin.bottom])
        .domain(data1.map(function(d){return d.Name;}))
        .padding(0.2);
    
    svg.append("g")
        .attr("transform", `translate(${margin.left/4}, 0)`) 
        .call(d3.axisLeft(y))
        .selectAll("text")
            .style("text-anchor","end"); 

    var x = d3.scaleLinear()
        .domain([-10, d3.max(data1, function(d){return d.Global_Sales;})])
        .range([0, graph_1_width - margin.right]);

    let color = d3.scaleOrdinal()
        .domain(data1.map(function(d) { return d.Name;}))
        .range(d3.quantize(d3.interpolateHcl("#4B0AFA", "#C5B3F8"), TOP_NUM));

    let bars = svg.selectAll("rect").data(data1);
    bars.enter()
        .append("rect")
            .attr("x", x(0))
            .attr("y", function(d) {return y(d.Name); })
            .attr("width", function(d){return x(parseInt(d.Global_Sales))})
            .attr("height", y.bandwidth())
            .attr("fill", function(d){return color(d.Name)});
    
    let sales = countRef.selectAll("text").data(data1);

    sales.enter()
        .append("text")
        .merge(sales)
        .attr("fill", function(d){ return color(d.Name);})
        .attr("x", function(d){return x(parseInt(d.Global_Sales)+12);})  
        .attr("y", function(d){return y(d.Name)+10;})
        .style("text-anchor", "start")
        .text(function(d){return d.Global_Sales});  

    svg.append("text")
        .attr("transform", `translate(${(graph_1_width -margin.left-margin.right)/2}, ${graph_1_height-margin.bottom})`)  
        .style("text-anchor", "middle")
        .text("Global Sale (in Millions)");

    
    svg.append("text")
        .attr("transform", `translate(${60 -margin.left}, ${(graph_1_height-margin.top-margin.bottom)/2})rotate(-90)`)  
        .style("text-anchor", "middle")
        .text("Name of the Game");

    
    svg.append("text")
        .attr("transform", `translate(${margin.left},  ${-20})`)  
        .style("text-anchor", "middle")
        .style("font-size", 16)
        .text("Top 10 Video Games of All Time");




    //graph 2, the pie chart 
    data_total = regional_data(data, "Global_Sales");
    data_na = regional_data(data, "NA_Sales");
    data_eu = regional_data(data, "EU_Sales");
    data_jp = regional_data(data, "JP_Sales");
    data_other = regional_data(data, "Other_Sales");

    change(data_total);
    set_tooltip(data_total);
 
    svg2.append("text")
        .attr("transform", `translate(0, ${-(graph_2_height+margin.top)/2})`)  
        .style("text-anchor", "middle")
        .style("font-size", 16)
        .text("Best Selling Genre by Regions")


    data3 = cleanPublisher(data); //dict within dict

    data_action = genrePub(data3, "Action");

    //graph 3
    
    bar_plot_update("Action");

})

var x = d3.scaleBand()
.range([0, graph_3_width-margin.left-margin.right])
.padding(0.2);

var xAxis = svg3.append("g")
.attr("transform",`translate(0,${(graph_3_height-margin.top-margin.bottom)})`) 

var y = d3.scaleLinear()
.range([graph_3_height-margin.top-margin.bottom,0]);

var yAxis = svg3.append("g")
.attr("class", "myYaxis")

var tx = svg3.append("g");

svg3.append("text")
    .attr("transform", `translate(${-margin.right/2}, ${(graph_3_height-margin.top-margin.bottom)/2})rotate(-90)`)  
    .style("text-anchor", "middle")
    .text("Total Global Sales (in Million)")


svg3.append("text")
    .attr("transform", `translate(${(graph_3_width -margin.left-margin.right)/2},  ${-20})`)  
    .style("text-anchor", "middle")
    .style("font-size", 16)
    .text("Top Publishers in Each Genre")


svg3.append("text")
    .attr("transform", `translate(${(margin.left)}, ${graph_3_height+margin.bottom/2})`)  
    .style("text-anchor", "middle")
    .style("font-size", 15)
    .text("Publisher Name")


function bar_plot_update(option){
    //data should be array of dictionaries

    data = genrePub(data3, option);

    x.domain(data.map(function(d){return d.Publisher;}))

    xAxis.call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-30)")
        .style("text-anchor", "end");
        
        
    y.domain([0, (d3.max(data, function(d){return d.Sales;}))+20])

    yAxis.transition().duration(1000).call(d3.axisLeft(y))

    var u = svg3.selectAll("rect")
        .data(data)
            
        u.enter()
            .append("rect")
            .merge(u)
            .transition()
            .duration(1000)
                .attr("x", function(d){return x(d.Publisher);})
                .attr("y", function(d){return y(d.Sales);})
                .attr("width", x.bandwidth())
                .attr("height", function(d){return graph_3_height-margin.top-margin.bottom - y(d.Sales);})
                .attr("fill", "#C5B3F8")
    
        u.exit()
            .remove();
        
        var ref = tx.selectAll("text").data(data);

        ref.enter()
            .append("text")
            .merge(ref)
            .transition()
            .duration(1000)
            .attr("y", function(d){return y(parseInt(d.Sales)+5)})
            .attr("x", function(d){return x(d.Publisher)+10}) 
            .text(function(d){return parseInt(d.Sales)})
            .style("font-size", 6);
    
    }


function change(data){

    var radius = 120;

    var colors = d3.scaleOrdinal(d3.schemeSet3);

    var pie = d3.pie().sort(null)
        .value(function(d){return d.Sales;});

    path = d3.select("svg")
        .selectAll("path");

    var u = svg2.selectAll("path").data(pie(data))

    var seg = d3.arc().innerRadius(0).outerRadius(radius)

    u.enter()
        .append("path")
        .merge(u)
        .transition()
        .duration(1000)
        .attr("d", seg)
        .attr("fill", function(d){return colors(d.data.Genre);})
        .attr("stroke", "white")
        .style("stroke-width", "1px");
    
    u.exit().remove();

    //legend
    var legend = svg2.selectAll('.legend') 
        .data(colors.domain())
        .enter() 
        .append("g") 
        .attr('class', 'legend') 
        .attr('transform', function(d, i) {                   
          var height = leg_rect_size + leg_space;      
          var offset =  height * colors.domain().length / 2; 
          var horz = 12 * leg_rect_size; 
          var vert = i * height - offset; 
            return 'translate(' + horz + ',' + vert + ')';  
         });

    legend.append('rect')                                
         .attr('width', leg_rect_size)                     
         .attr('height', leg_rect_size)                    
         .style('fill', colors) 
         .style('stroke', colors);

    legend.append('text')                                    
         .attr('x', leg_rect_size + leg_space)
         .attr('y', leg_rect_size - leg_space)
         .text(function(d) { return d; })
        
}

function set_tooltip(data){
    //console.log(data)

    var total = d3.sum(data.map(function(d){ return d.Sales;})); 

    var pie = d3.pie().sort(null)
        .value(function(d){return d.Sales;});

    var p = svg2.selectAll("path")
    .data(pie(data))
    .on('mouseover', function (d, i) {
        d3.select(this).transition()
             .duration('50')
             .attr('opacity', '.85');
        
        tooltip.transition()
             .duration(50)
             .style("opacity", 1);

        let num = ((d.value / total) * 100).toFixed(2).toString() + '%'; 


        tooltip.html(d.data.Genre + " " +num)
            .style("left", (d3.event.layerX + 10) + 'px')
            .style("top", (d3.event.layerY + 10) + 'px')
            .style("display", "block");
        })
        
    .on('mouseout', function (d, i) {
        d3.select(this).transition()
            .duration('50')
            .attr('opacity', '1');

        tooltip.transition()
            .duration('50')
            .style("opacity", 0);});

}

//function which sorts data
function cleanData(data, comparator, num){

    data = data.sort(comparator);
    data = data.slice(0, num);
    return data;
}

function genrePub(data, cat){
//need to return {publisher: publ, total sales: num } for a specific genre 
    var pub_list = data[cat];
    var result = [];

   //console.log(pub_list);

    let publisher = Object.keys(pub_list);
    let sales = Object.values(pub_list);

    for (var i=0; i<publisher.length; i++){
        var new_obj = {Publisher: publisher[i], Sales: sales[i]};
        result.push(new_obj);
    }

    result = cleanData(result, function(a,b){return b.Sales- a.Sales;}, TOP_NUM);

    return result;
}

function cleanPublisher(data){
    var cat =[],
        pub = [],
        sales = [];

    data.map(function(d){
        cat.push(d.Genre);
        pub.push(d.Publisher);
        sales.push(d.Global_Sales);
    })

    sales = sales.map(function(x){return parseFloat(x)})

    var length = cat.length;
    var dict = {};
    for (var i=0; i<length; i++){
        if (!(cat[i] in dict)){ //if the category is not in the dictionary
            var cur_dic = {};
            cur_dic[pub[i]] = sales[i];
            dict [cat[i]] = cur_dic;
            //category: {publisher: sales}
        }else{
            var old = dict[cat[i]]; //the old value i.e dictionary
            if(!(pub[i] in old)){
                old[pub[i]] = sales[i];
            }else{
                var prev = old[pub[i]];
                old[pub[i]] = prev + sales[i];
            }
        }

    } 
    
    return dict;
}


function regional_data(data, region){
    //return genere and sales for each region
    var cat = [],
        sales = [];

    data.map(function(d){
        cat.push(d.Genre);
        sales.push(d[region]);})
    
    sales = sales.map(function(x){return parseFloat(x)})

    var length = cat.length;

    var dict = {};

    for (var i=0; i<length; i++){
        if(!(cat[i] in dict)){
            dict[cat[i]] = sales[i];
        }else{
            var old = dict[cat[i]];
            dict[cat[i]]= old+ sales[i];
        }
    }


    let genre = Object.keys(dict);
    let t_sales = Object.values(dict);

    result = [];
    for (var i=0; i<genre.length; i++){
        var new_obj = {Genre: genre[i], Sales: t_sales[i]};
        result.push(new_obj);
    }

    return result; //this should return dict{genre:"", total_sales:float}
}