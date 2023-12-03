// set the dimensions and margins of the graph
const margin = ({ top: 10, right: 0, bottom: 10, left: 20 })
const width = document.querySelector("#sankey").clientWidth * .95;
const height = document.querySelector("#sankey").clientHeight * .9;

const countryDomain = ['Iraq', 'Philippines', 'Syria', 'Mexico', 'Pakistan', 'Colombia', 'India', 'Somalia', 'Russia', 'Afghanistan',
    'Israel and the Occupied Palestinian Territory', 'Brazil', 'Algeria', 'Honduras', 'Ukraine'];

const countryColors = {
    'Iraq': '#1f77b4',
    'Philippines': '#ff7f0e',
    'Syria': '#2ca02c',
    'Mexico': '#d62728',
    'Pakistan': '#9467bd',
    'Colombia': '#8c564b',
    'India': '#e377c2',
    'Somalia': '#7f7f7f',
    'Russia': '#bcbd22',
    'Afghanistan': '#17becf',
    'Israel and the Occupied Palestinian Territory': '#ff9896',
    'Brazil': '#aec7e8',
    'Algeria': '#ffbb78',
    'Honduras': '#98df8a',
    'Ukraine': '#c5b0d5'
};

const CountryCategoricalScale = d3.scaleOrdinal()
    .domain(countryDomain)
    .range(countryDomain.map(country => countryColors[country]));
// add designated color into range  

const nodeColorScale = d3.scaleOrdinal(d3.schemeCategory10);

// format variables
var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function (d) { return formatNumber(d); }


// append the svg object to the body of the page
var svg = d3.select("#sankey")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Set the sankey diagram properties
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(11)
    .size([width, height]);

var path = sankey.links();


d3.csv("./data/sankey_journalist.csv").then(function (data) {

    //set up graph in same style as original example but empty
    var sankeydata = { "nodes": [], "links": [] };

    data.forEach(function (d) {
        sankeydata.nodes.push({ "name": d.source });
        sankeydata.nodes.push({ "name": d.target });
        sankeydata.links.push({
            "source": d.source,
            "target": d.target,
            "value": +d.value
        });
    });

    // return only the distinct / unique nodes
    sankeydata.nodes = Array.from(
        d3.group(sankeydata.nodes, d => d.name),
        ([value]) => (value)
    );

    // loop through each link replacing the text with its index from node
    sankeydata.links.forEach(function (d, i) {
        sankeydata.links[i].source = sankeydata.nodes
            .indexOf(sankeydata.links[i].source);
        sankeydata.links[i].target = sankeydata.nodes
            .indexOf(sankeydata.links[i].target);
    });

    // now loop through each nodes to make nodes an array of objects
    // rather than an array of strings
    sankeydata.nodes.forEach(function (d, i) {
        sankeydata.nodes[i] = { "name": d };
    });

    const graph = sankey(sankeydata);
    console.log(graph.links)

    // add in the links
    var link = svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function (d) { return +d.width });

    // // add in the links
    // var link = svg.append("g").selectAll(".link")
    //     .data(graph.links)
    //     .enter().append("g")
    //     .attr("class", "link");

    // // Create the gradient definition
    // var gradient = link.append("linearGradient")
    //     .attr("id", function (d, i) { return "gradient" + i; })
    //     .attr("gradientUnits", "userSpaceOnUse")
    //     .attr("x1", function (d) { return d.source.x1; })
    //     .attr("x2", function (d) { return d.target.x0; });

    // // Define the gradient stops
    // gradient.append("stop")
    //     .attr("offset", "0%")
    //     .attr("stop-color", function (d) {
    //         return nodeColorScale(d.source.name.replace(/ .*/, ""));
    //     });

    // gradient.append("stop")
    //     .attr("offset", "80%")
    //     .attr("stop-color", function (d) {
    //         return nodeColorScale(d.target.name.replace(/ .*/, ""));
    //     });

    // // Draw the links using the gradient
    // link.append("path")
    //     .attr("class", "link")
    //     .attr("d", d3.sankeyLinkHorizontal())
    //     .attr("stroke-width", function (d) { return +d.width })
    //     .style("fill", function (d, i) {
    //         return "url(#gradient" + i + ")";
    //     });



    // add the link titles
    link.append("title")
        .text(function (d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value);
        });

    // add in the nodes
    var node = svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node");

    // add the rectangles for the nodes
    node.append("rect")
        .attr("x", function (d) { return d.x0; })
        .attr("y", function (d) { return d.y0; })
        .attr("height", function (d) { return d.y1 - d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) {
            if (countryDomain.includes(d.name.replace(/ .*/, ""))) {
                // Key is in the domain
                return CountryCategoricalScale(d.name.replace(/ .*/, ""));
            } else {
                // Key is not in the domain
                return nodeColorScale(d.name.replace(/ .*/, ""));
            }
        })
        .append("text")
        .text(function (d) {
            return d.name + "\n" + format(d.value);
        })
        .style("stroke", function (d) {
            return d3.rgb(nodeColorScale(d.name.replace(/ .*/, ""))).darker(2);
        });

    // add in the title for the nodes
    node.append("text")
        .attr("x", function (d) { return d.x0 - 6; })
        .attr("y", function (d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x0 < width / 2; })
        .attr("x", function (d) { return d.x1 + 6; })
        .attr("text-anchor", "start");

});
