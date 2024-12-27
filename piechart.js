/*
piechart.js:
This JavaScript file contains the logic to fetch emissions data and create the drilldown pie chart.
*/

async function loadChartData() {
    try {
        // Fetch the emission data from emission_data json file
        const response = await fetch('emission_data.json');
        const data = await response.json();

        // Initialise arrays to store the main data (top-level) and detailed data (drilldown)
        const topLevel = []; // This will hold overall scope data (Scope 1, Scope 2, Scope 3)
        const drilldownData = []; // This will hold data for categories and activities within scopes

        // Loop through each scope in the data
        Object.entries(data).forEach(([scope, categories]) => {
            // Process each category within the scope
            const scopeCategories = Object.entries(categories).map(([category, activities]) => {
                // Calculate the total emissions for each category by summing all activity values
                const categoryTotal = activities.reduce((sum, [, value]) => sum + value, 0);

                // Add detailed activity data for drilldown
                drilldownData.push({
                    id: `${scope}-${category}`, // Unique ID for drilldown, e.g. "Scope 1-1.1 - Stationary combustion"
                    name: category, // The name of the category, e.g. "1.1 - Stationary combustion"
                    data: activities // Detailed activity data including emissions, e.g. [["Activity 1", "348.22 tonnes CO2e"]]
                });

                // Return category summary for the main chart
                return {
                    name: category, // The name of the category
                    y: categoryTotal, // Total (summed) emissions for this category
                    drilldown: `${scope}-${category}` // Link to the detailed drilldown data (through the id)
                };
            });

            // Calculate the total emissions for the entire scope by summing all categories
            const scopeTotal = scopeCategories.reduce((sum, cat) => sum + cat.y, 0);

            // Add scope summary to the main chart data
            topLevel.push({
                name: scope, // The name of the scope
                y: scopeTotal, // Total emissions for the scope
                drilldown: scope // Link to drilldown data for this scope (through the id)
            });

            // Add scope-level drilldown data 
            drilldownData.push({
                id: scope, // Unique ID for the scope drilldown
                name: scope, // The name of the scope
                data: scopeCategories // List of categories and their totals within the scope
            });
        });

        // Create pie chart
        Highcharts.chart('container', {
            chart: { type: 'pie' },
            title: { text: 'Emissions: From Scopes to Activities' },
            subtitle: { text: 'Click slices to drill down into categories and activities for a detailed view of environmental impact.' },
            tooltip: {
                // Format tooltip to show emissions in tonnes of CO2e when hovering
                pointFormat: '<span style="color:{point.color}">●</span> {point.name}: <b>{point.y:.2f} tonnes CO2e</b>'
            },
            plotOptions: {
                pie: {
                    shadow: true,
                    size: '75%',
                    dataLabels: {
                        enabled: true, // Enable the display of data labels on the chart
                        style: {
                            color: '#000000',
                            fontSize: '14px'
                        }
                    }
                },
                series: {
                    borderRadius: 5,
                    dataLabels: [
                        {
                            enabled: true, // Show labels for slice names
                            distance: 20, // Put the labels slightly outside the pie slices
                            format: '{point.name}' // Display the name of the slice in the label
                        },
                        {
                            enabled: true, // Show percentage labels
                            distance: '-30%', // Put percentage labels inside the pie slices
                            filter: {
                                // Displays percentage labels only for slices above a 5% threshold
                                property: 'percentage',
                                operator: '>',
                                value: 5
                            },
                            format: '{point.percentage:.1f}%', // Show percentage with one decimal 
                            style: {
                                fontSize: '1em',
                                textOutline: 'none' // Remove text outline for better readability
                            }
                        }
                    ]
                }
            },
            series: [
                {
                    name: 'Scopes', // The name of the main data series
                    colorByPoint: true, // Automatically assign colors to the pie slices
                    data: topLevel // Uses the main chart data (scopes)
                }
            ],
            drilldown: {
                series: drilldownData // Supply drilldown data for the chart
            }
        });
    } catch (error) {
        // Log an error message if the data cannot be loaded
        console.error('Error loading data:', error);
    }
}

// Call the function to load the data and render the pie chart
loadChartData();
