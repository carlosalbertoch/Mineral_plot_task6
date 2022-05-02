//cargar el seleccionador con las opciones
let vector = ["aaa", "abc", "abd"];

const minerals=[
    {name:"Allanite"},
    {name:"Albite"},
    {name:"Apatite"},
    {name:"barite"},
    {name:"biotite"}
]
let output=""
for (let i=0; i<minerals.length; i++){
    output=output+`<option>${minerals[i].name}</option>`
}

document.getElementById("eds-select").innerHTML=output;

const MARGIN = { LEFT: 100, RIGHT: 50, TOP: 50, BOTTOM: 100 }
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
const HEIGHT = 300 - MARGIN.TOP - MARGIN.BOTTOM

const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.TOP + MARGIN.BOTTOM)

const g = svg.append("g")
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)   
const formatear=d3.format(".1f")
// axis generators
const xAxisCall = d3.axisBottom()
    .tickFormat(d => formatear(d/100)) 
    .ticks(10)
const yAxisCall = d3.axisLeft()
	.ticks(4)
	.tickFormat(d => `${formatear(d / 1000)}k`)       
// axis groups
const xAxis = g.append("g")
	.attr("class", "x axis")
	.attr("transform", `translate(0, ${HEIGHT})`)
    
const yAxis = g.append("g")
	.attr("class", "y axis") 

//notes
const note = g.append("g")
	.attr("class", "note") 

const miner=g.append("g")
    .attr("class", "miner-data") 


// scales
const x = d3.scaleLinear().range([0, WIDTH])
const y = d3.scaleLinear().range([HEIGHT, 0])


// time parser for x-scale se crea como una funcion
//const parseTime = d3.timeParse("%Y")
// y-axis label
xAxis.append("text")
    .attr("class", "axisX-title")
    //.attr("transform", `translate(${WIDTH/2},${HEIGHT})`)
	.attr("y", 25)
    .attr("x", WIDTH/2)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
    .text("Energy KeV")
    .style("font-size","12px")

// y-axis label
yAxis.append("text")
	.attr("class", "axisY-title")
	.attr("transform", "rotate(-90)")
	.attr("y", -45)
    .attr("x", -HEIGHT/2.5)
	.attr("dy", ".71em")
	.style("text-anchor", "end")
	.attr("fill", "#5D6971")
	.text("Cnt")

// y-axis label
note.append("text")   
    .attr("class", "note-title")



// line path generator
const line = d3.line()
    //.curve(d3.curveMonotoneX)
	.x(d => x(d.energia))
	.y(d => y(d.intensidad))

const area = d3.area()
    //.curve(d3.curveMonotoneX)
    .x(d => x(d.energia))
    .y0(HEIGHT)
    .y1(d => y(d.intensidad))  

g.append("clipPath")
    .attr("id", "clip")
    .append("rect")
        .attr("width", WIDTH)
        .attr("height", HEIGHT);      
const edsName = $("#eds-select").val()

const nameMin=String(`${edsName}.json`)
//console.log(String(nameMin))
// for tooltip determinar en que pos va a caer el puntero 
//crea la posicion de un nuevo dato 
const bisectEnergy = d3.bisector(d => d.energia).left        
d3.json(nameMin).then(data => {
	// clean data
    
    //console.log(data)
    filteredData = {}
	Object.keys(data).forEach(minerals => {
        filteredData[minerals] = data[minerals]
        .filter(d => {
            return !(d['energia'] == null)
        }).map(d => {
            d.energia= Number(d.energia)
            d.intensidad= Number(d.intensidad)
            return d
            
		})
    //console.log(data.Albite[0].element)
    //console.log(data.Albite[0].pick_pos[1])
    //console.log(data.mineral.slice(1,data.length))
    
    // run the visualization for the first time
    update(data)
    
    })

}) 

// event listeners para elegir
$("#eds-select").on("change", update) 

function update(data){
    const t = d3.transition().duration(2000)
    const edsName = $("#eds-select").val()
    const nameMin=String(`${edsName}.json`)
    //console.log(String(nameMin))

    d3.json(nameMin).then(data => {
        // clean data
        
        //console.log(data)
        filteredData = {}
        Object.keys(data).forEach(minerals => {
            filteredData[minerals] = data[minerals]
            .filter(d => {
                return !(d['energia'] == null)
            }).map(d => {
                d.energia= Number(d.energia)
                d.intensidad= Number(d.intensidad)
                return d
                
            })
        
        // run the visualization for the first time
        
        })
    
    // clear old tooltips
	d3.select(".focus").remove()
	d3.select(".overlay").remove()
    d3.select(".area").remove()
    d3.select(".line").remove()
    d3.select(".note-graph").remove()
    d3.selectAll(".simbol-text").remove()
    //console.log(Object.keys(data))
    const dataElement=data.mineral[0].element;
    const dataPickx=data.mineral[0].pick_posx;
    const dataPicky=data.mineral[0].pick_posy;

    data=data.mineral.slice(1,data.length)
    data=data.splice(0,data.length/3)
    


    x.domain(d3.extent(data, d => d.energia))
	y.domain([
		d3.min(data, d => d.intensidad) / 1.005, 
		d3.max(data, d => d.intensidad) * 1.005,
	])
    // generate axes once scales have been set
	xAxis.call(xAxisCall.scale(x))
    xAxis.transition(t).call(xAxisCall)
	yAxis.call(yAxisCall.scale(y))
    yAxis.transition(t).call(yAxisCall)
    // filter data based on selections
	
    miner.selectAll("text")
        .attr("class", "simbol-text-all")
        .data(dataElement)
        .enter()
        .append("text")
            .attr("class", "simbol-text")
            .attr("x", (d, i) => dataPickx[i])
            .attr("y",  (d, i) => {console.log(dataPicky)
                return dataPicky[i]})
            .text(d => d)
            .attr("dx", "-.15em")
            .attr("dy", "-.45em");
    

    const max=d3.max(data, d => (d.intensidad) * 1.005)

    
    // add area to chart
    g.append("path")
        .attr("class", "area")
        .attr("clip-path", "url(#clip)")
        .attr("d", area(data))
        .attr("fill","#72b391")
        .attr("fill-opacity","0.5")  
    // add line to chart
    g.append("path")
		.attr("class", "line")
		.attr("fill", "none")
		.attr("stroke", "#3182bd")
		.attr("stroke-width", "1.2px")
        .attr("clip-path", "url(#clip)")
		.attr("d", line(data))
    note.append("text")
        .attr("class", "note-graph")
		.attr("x", WIDTH/2)
        .attr("y", 0)
		.attr("dy", ".35em")
        .text(edsName)
//----- otras cosas-----------------------------
    const focus = g.append("g")    
        .attr("class", "focus")
        .style("display", "none")
    
    focus.append("line")
		.attr("class", "x-hover-line hover-line")
        .style("stroke", "#3182bd")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.4)
		.attr("y1", 0)
		.attr("y2", HEIGHT)   
        
    focus.append("line")
		.attr("class", "y-hover-line hover-line")
        .style("stroke", "#3182bd")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.4)
		.attr("x1", 0)
		.attr("x2", WIDTH)   
        
    focus.append("circle")
        .style("fill", "none")
        .style("stroke", "#3182bd")
        .style("stroke-width", "1px")
        .style("opacity", 0.5)
        .attr("r", 2);   

    focus.append("text")
        .attr("class", "GraphT")
		.attr("x", 5)
        .attr("y", -10)
		.attr("dy", ".35em")  
        
    g.append("rect")
		.attr("class", "overlay")
		.attr("width", WIDTH)
		.attr("height", HEIGHT)
        .style("fill", "none")
        .style("pointer-events", "all")
		.on("mouseover", () => focus.style("display", null))
		.on("mouseout", () => focus.style("display", "none"))
		.on("mousemove", mousemove)    

    function mousemove() {
        const x0 = x.invert(d3.pointer(event,this)[0])
        const i = bisectEnergy(data, x0, 1)
        const d0 = data[i - 1]
        const d1 = data[i]
        const d = x0 - d0.energia > d1.energia - x0 ? d1 : d0  
        console.log(d3.pointer(event,this)[1])
        focus.attr("transform", `translate(${x(d.energia)}, ${y(d.intensidad)})`)
		focus.select("text").text(d.intensidad)
		focus.select(".x-hover-line").attr("y2", HEIGHT - y(d.intensidad))
		focus.select(".y-hover-line").attr("x2", -x(d.energia))
    }  
    g.select(".area")
        .transition(t)
        .style("fill", "#72b391")

    g.select(".area")
        .transition(t)
        .style("fill", "#3182bd")

    }) 
    
}     
