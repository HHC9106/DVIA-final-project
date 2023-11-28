//   Register to get your Mapbox access token https://docs.mapbox.com/help/glossary/access-token/
//   Code from https://docs.mapbox.com/help/tutorials/custom-markers-gl-js/ 

mapboxgl.accessToken = 'pk.eyJ1IjoiYW5keTkxMDYxNCIsImEiOiJjbG5heGQ0YnAwN2hoMmxvMm1rbjR5aW9jIn0.HD5O5lWSWsJUMfKkW-WDaQ'

// https://www.mapbox.com/mapbox-gl-js/api/#map
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/light-v9',  // try your own, i.e. mapbox://styles/sauter/cksi9buw56sk918mkg9c58qjf
    center: [18.2812, 9.1021], // 9.1021° N, 18.2812° E
    zoom: 1.5,
    minZoom: 1.5,
    dragRotate: false, // Disable 3D rotation
    // scrollZoom: false, // Disable scroll zooming
    maxZoom: 5, // Set the maximum allowed zoom level
})

const spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`;

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


map.on('load', function () {

    // Load GeoJSON data
    d3.json('./vector/worldmap_centroid_deathyearcount.geojson')
        .then((geojson) => {


            // Filter data for a specific year 
            let yearToFilter = 2020;
            let filteredData = geojson.features.filter(d => d.properties.year === yearToFilter);

            //add svg
            let svg = d3.select('#map')

            // Define the projection function using Mapbox GL JS
            function projectPoint(lon, lat) {
                let point = map.project(new mapboxgl.LngLat(lon, lat));
                return [point.x, point.y];
            }


            // Add circles using D3
            map.on('render', function () {
                // Remove existing SVG overlay
                d3.select('#map svg').remove();

                // Create a new SVG overlay
                let svg = d3.select('#map').append('svg')
                    .attr('width', map._container.clientWidth)
                    .attr('height', map._container.clientHeight)
                    .style('position', 'absolute');

                svg.selectAll('path')
                    .data(filteredData)
                    .enter()
                    .append('path')
                    .attr('transform', d => `translate(${projectPoint(d.geometry.coordinates[0], d.geometry.coordinates[1])})`)
                    .attr('d', d => spike((d.properties.counts) * 8)) // Adjusted based on your original circle radius calculation
                    .attr('fill', 'lightgrey')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.85)
                    .attr('fill-opacity', 0.85)
                    .on('mouseover', function (event,d) {
                        const tooltipText = `${d.properties.country}, ${d.properties.counts} death`;
                        console.log(d)
                
                        // Show tooltip
                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);

                        tooltip.html(tooltipText)
                            .style("left", (event.pageX + 5) + "px")
                            .style("top", (event.pageY - 28) + "px");
                    })
                    .on('mouseout', function () {
                        // Hide tooltip
                        tooltip.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });


                // svg.selectAll('path') // Use 'path' instead of 'circle'
                //     .data(filteredData)
                //     .enter()
                //     .append('g')
                //     .attr('transform', d => `translate(${projectPoint(d.geometry.coordinates[0], d.geometry.coordinates[1])})`)
                //     .append('path')
                //     .attr('d', d => spike((d.properties.counts) *8)) // Adjusted based on your original circle radius calculation
                //     .attr('fill', 'grey')
                //     .attr('stroke', 'white')
                //     .attr('stroke-width', 0.75)
                //     .attr('fill-opacity', 0.75)
                //     .append('title')
                //     .text(d => `(${d.geometry.coordinates[0]}, ${d.geometry.coordinates[1]}) Counts: ${d.properties.counts}`);

                // Reposition the SVG overlay when the map is resized
                map.on('resize', function () {
                    d3.select('#map svg')
                        .attr('width', map._container.clientWidth)
                        .attr('height', map._container.clientHeight);
                });
            })


            map.addSource('indexmap', {
                type: 'geojson',
                data: './vector/worldmap_freedom_index.geojson'
            });

            map.addLayer({
                'id': 'colormap',
                'type': 'fill',
                'source': 'indexmap',
                'layout': {},
                'paint': {
                    'fill-color': [
                        'step',
                        ['to-number', ['get', 'Score']],
                        // Your classification thresholds and corresponding colors
                        '#720026',
                        40, '#d52941',
                        60, '#fcd581',
                        70, '#fff8e8',
                        80, '#ffffff',
                    ],
                    'fill-opacity': 0.5 // Set the stroke color here
                }
            });

            map.addControl(new mapboxgl.NavigationControl());


        });
})