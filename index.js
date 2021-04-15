const w = 1000
const h = 800
const m = 40
const rect = 20

const svg = d3.select('.d3-container')
    .append('svg')
    .attr('width', w)
    .attr('height', h)

// color stuff
const n = 6
const t = []
const colorArr = d3.schemeGreens[n]

for (let i = 0; i < colorArr.length; i++) {
    t.push((i / colorArr.length).toFixed(2))
}
t.push(1)

const getColor = (num) => {
    num /= 100
    for (let i = 0; i < t.length; i++) {
        if (num < t[i]) {
            return colorArr[i]
        }
    }
}

const lScale = d3.scaleLinear()
    .domain([t[0], t[t.length - 1]])
    .range([0, (n) * 20])

const lAxis = d3.axisBottom(lScale)
    .tickValues([...t])
    .tickFormat(d3.format(".0%"))
    .tickSize([4])

console.log(lScale(t[5]))

const legend = svg
    .append('g')
    .attr('transform', 'translate(700, 20)')

legend
    .selectAll('rect')
    .data(colorArr)
    .enter()
    .append('rect')
    .attr('fill', (d) => d)
    .attr('width', rect)
    .attr('height', rect)
    .attr('x', (d, i) =>  i * rect)
    .attr('y', 0)


legend.append('g')
    .attr('class', 'caption')
    .attr('transform', 'translate(-0.5, 20)')
    .call(lAxis)

d3.select('svg')
    .append('text')
    .attr('x', w - 400)
    .attr('y', h - 80)
    .text('Source: USDA Economic Research Service')



const path = d3.geoPath();

const tooltip = d3.select('.d3-container')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0)

// convert files to json
const files = ['https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json', 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json'];
const promises = [];

files.forEach((url) => promises.push(d3.json(url)))

Promise.all(promises).then(function (v) {
    const topo = v[0]
    const topoCounties = topojson.feature(topo, topo.objects.counties).features
    const county = v[1]
    console.log(topojson.mesh(topo, topo.objects.states))

    svg.append('g')
        .selectAll("path")
        .data(topoCounties)
        .enter()
        .append("path")
        .attr('d', path)
        .attr('fill', (d) => {
            let fips = d.id;
            return getColor(county.filter(x => x.fips === fips)[0].bachelorsOrHigher)
        })
        .on('mousemove', (e, d) => {
            let fips = d.id
            let countyInfo = county.filter(x => x.fips === fips)[0]
            let education = countyInfo.bachelorsOrHigher
            let countyName = countyInfo.area_name
            tooltip
                .style('opacity', 0.9)
                .html(
                    `${countyName + `: ` + education}%`
                )
                .style("left", e.pageX + 20 + "px")
                .style("top", e.pageY - 20 + "px")
        })
        .on("mouseout", function () {
            tooltip.style("opacity", 0);
        })
    svg
        .append('path')
        .datum(topojson.mesh(topo, topo.objects.states)
        )
        .attr('class', 'states')
        .attr('d', path);

});
