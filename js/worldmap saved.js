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

// set initial year
let yearToFilter = 2013;

const spike = (length, width = 7) => `M${-width / 2},0L0,${-length}L${width / 2},0`;

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);


map.on('load', function () {

    function updateMap() {
        // Load GeoJSON data
        d3.json('./vector/worldmap_centroid_deathyearcount.geojson')
            .then((geojson) => {

                // Filter data for a specific year 
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

                    // Create a drop shadow filter
                    svg.append('defs')
                        .append('filter')
                        .attr('id', 'drop-shadow')
                        .attr('height', '130%')
                        .append('feDropShadow')
                        .attr('dx', 0)
                        .attr('dy', 4)
                        .attr('stdDeviation', 4)
                        .attr('flood-color', 'rgba(0, 0, 0, 0.6)');

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
                        .style('filter', 'url(#drop-shadow)')  // Apply the drop shadow filter
                        .on('mouseover', function (event, d) {
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

                    // Reposition the SVG overlay when the map is resized
                    map.on('resize', function () {
                        d3.select('#map svg')
                            .attr('width', map._container.clientWidth)
                            .attr('height', map._container.clientHeight);
                    });
                })

                let sourceId = `indexmap_all_${yearToFilter}`;

                // Check if the source already exists
                if (!map.getSource(sourceId)) {
                    // If it doesn't exist, add the source and layer
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: `./vector/worldmap_freeIndex_${yearToFilter}.geojson`,
                    });

                    map.addLayer({
                        id: 'colormap',
                        type: 'fill',
                        source: sourceId,
                        layout: {},
                        paint: {
                            'fill-color': [
                                'step',
                                ['to-number', ['get', 'Score']],
                                '#720026',
                                50,
                                '#d52941',
                                60,
                                '#fcd581',
                                70,
                                '#fff8e8',
                                80,
                                '#ffffff',
                            ],
                            'fill-opacity': 0.5,
                        },
                    });
                } else {
                    // If it exists, update the data
                    map.getSource(sourceId).setData(`./vector/worldmap_freeIndex_${yearToFilter}.geojson`);
                }

            });
    }
    // Add slider
    const slider = document.getElementById('slider');
    const sliderValue = document.getElementById('slider-value');

    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '2013');
    slider.setAttribute('max', '2023');
    slider.setAttribute('step', '1');
    slider.setAttribute('value', '2023');

    updateMap();

    slider.addEventListener('input', function () {
        let yearToFilter = parseInt(this.value);
        // Filter GeoJSON data for the selected year
        console.log(yearToFilter)
        updateMap();
    });

    map.addControl(new mapboxgl.NavigationControl());
})