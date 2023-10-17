let url ="https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
let req = new XMLHttpRequest()

let baseTemp
let dataset

let xScale 
let yScale 

let minYear
let maxYear


let w = 1200;
let h = 600;
let padding = 60;

let canvas = d3.select('#canvas')
canvas.attr("width", w)
canvas.attr("height", h)

req.open('GET', url, true)
req.onload = () => {
   let object = JSON.parse(req.responseText)
   baseTemp = object['baseTemperature']
   dataset = object['monthlyVariance']
   console.log(dataset)
   console.log(baseTemp)
   generateScales()
   drawCells()
   generateAxes()
   
}
req.send();

let tooltip = d3.select('#tooltip')

let generateScales = () => {

    minYear = d3.min(dataset, (item) => {
        return item['year']
    })
    maxYear = d3.max(dataset, (item) => {
        return item['year']
    })

    xScale = d3.scaleLinear()
                .domain([minYear, maxYear + 1])
                .range([padding, w - padding])

    yScale = d3.scaleTime()
                .domain([new Date(0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0)])
                .range([padding, h - padding])
};

let drawCells = () => {

    canvas.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('class','cell')
    .attr('fill', (item) => {
        variance = item['variance']
        if(variance <= -1) {
            return 'SteelBlue'
        } else if (variance <= 0) {
            return 'LightSteelBlue'
        } else if (variance <= 1) {
            return 'Orange'
        } else {
            return 'crimson'
        }
    })
    .attr('data-year', (item) => {
        return item['year']
    })
    .attr('data-month', (item) => {
        return item['month'] - 1
    })
    .attr('data-temp', (item) => {
        return baseTemp + item['variance']
    })
    .attr('height', (h - (2* padding)) / 12)
    .attr('y', (item) => {
        return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0))
    })
    .attr('width', (item) => {
        let numberOfYears = maxYear - minYear
        return (w - (2 * padding)) / numberOfYears
    })
    .attr('x', (item) => {
        return xScale(item['year'])
    })
    .on('mouseover', (item) => {
        tooltip.transition()
        .style('visibility', 'visible')

        let monthNames = [
            'Januray',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
           ' October',
            'November',
            'December'
        ]
        tooltip.text(item['year'] 
        + " " 
        + monthNames[item['month'] - 1] 
        +  "  "
        + (baseTemp + item['variance'] 
        + " ℃" 
        + " (" 
        + item['variance'] 
        + " ℃" 
        + ")" ))
        tooltip.attr('data-year', item['year'])
    })
    .on('mouseout', (item) => {
        tooltip.transition()
        .style('visibility', 'hidden')
    })
};

let generateAxes = () => {
    let xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'))
    canvas.append('g')
              .call(xAxis)
              .attr('transform', 'translate (0, ' + (h - padding) + ')')
              .attr('id','x-axis')

    let yAxis = d3.axisLeft(yScale)
                .tickFormat(d3.timeFormat('%B'))
        
                canvas.append('g')
                .call(yAxis)
                .attr('transform', 'translate (' + (padding) + ', 0)')
                .attr('id','y-axis')
};