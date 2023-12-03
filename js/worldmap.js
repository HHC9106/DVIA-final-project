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
    // Initialize the SVG
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

    let layerId = 'colormap';


    function updateMap() {
        // Load GeoJSON data
        d3.json('./vector/worldmap_centroid_deathyearcount.geojson')
            .then((geojson) => {

                // Filter data for a specific year 
                let filteredData = geojson.features.filter(d => d.properties.year === yearToFilter);

                // Define the projection function using Mapbox GL JS
                function projectPoint(lon, lat) {
                    let point = map.project(new mapboxgl.LngLat(lon, lat));
                    return [point.x, point.y];
                }

                // Remove existing layer if it exists
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }

                // Remove existing source if it exists
                let sourceId = `indexmap_all_${yearToFilter}`;
                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }

                // Remove existing SVG overlay
                svg.selectAll('*').remove();

                svg.selectAll('path')
                    .data(filteredData)
                    .enter()
                    .append('path')
                    .attr('transform', d => `translate(${projectPoint(d.geometry.coordinates[0], d.geometry.coordinates[1])})`)
                    .attr('d', d => spike((d.properties.counts) * 8))
                    .attr('fill', 'lightgrey')
                    .attr('stroke', 'white')
                    .attr('stroke-width', 0.85)
                    .attr('fill-opacity', 0.85)
                    .style('filter', 'url(#drop-shadow)')
                    .on('mouseover', function (event, d) {
                        const tooltipText = `${d.properties.country}, ${d.properties.counts} death`;

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
                    svg.attr('width', map._container.clientWidth)
                        .attr('height', map._container.clientHeight);
                });

                // Add new source and layer
                map.addSource(sourceId, {
                    type: 'geojson',
                    data: `./vector/worldmap_freeIndex_${yearToFilter}.geojson`,
                });

                map.addLayer({
                    id: layerId,
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
            });
    }

    // Add slider
    const slider = document.getElementById('slider');
    const sliderValue = document.getElementById('slider-value');

    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '2013');
    slider.setAttribute('max', '2023');
    slider.setAttribute('step', '1');
    slider.setAttribute('value', '2013');

    updateMap();

    slider.addEventListener('input', function () {
        yearToFilter = parseInt(this.value);
        // Filter GeoJSON data for the selected year
        console.log(yearToFilter);
        updateMap();
    });

    map.addControl(new mapboxgl.NavigationControl());
});