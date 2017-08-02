window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

window.onload = function() {
    // Some native selectors
    let header = document.getElementById('header');
    let avgLastPrice = document.getElementById('avgLastPrice');
    let avgLowestAsk = document.getElementById('avgLowestAsk');
    let avgHighestBid = document.getElementById('avgHighestBid');

    const maxTickHistory = 25; // Max count of ticks we will display
    var tickerChart = null; // Global var for the chart.js object

    // Setup the socket.io events
    var socket = io.connect('http://localhost');

    socket.on('init', function(tickerInit) {
        // Set the header
        header.innerHTML = `${tickerInit.currencyPair} Ticker`;

        // Setup the chart
        tickerChart = setupChart(tickerInit.currencyPair);

        // Add the initial ticks
        tickerInit.tickHistory.forEach((value) => {
            addTickerUpdate(value);
        });
    });

    socket.on('tick', function(tickerUpdate) {
        // Update averages
        updateAverages(tickerUpdate.averages);

        // Add the latest tick
        addTickerUpdate(tickerUpdate.tick);
        
        // Remove any outdated ticks
        trimChartDataset();
    });

    /* Convenience functions */
    
    function updateAverages(tickerAverages) {
        if(tickerAverages) {
            avgLastPrice.innerHTML = tickerAverages.avgLastPrice.toFixed(6);
            avgLowestAsk.innerHTML = tickerAverages.avgLowestAsk.toFixed(6);
            avgHighestBid.innerHTML = tickerAverages.avgHighestBid.toFixed(6);
        }
    }

    function addTickerUpdate(tickerUpdate) {
        if(tickerChart) {
            let lastPrice = parseFloat(tickerUpdate.lastPrice);
            let lowestAsk = parseFloat(tickerUpdate.lowestAsk);
            let highestBid = parseFloat(tickerUpdate.highestBid);

            tickerChart.data.labels.push(tickerUpdate.moment);
            tickerChart.data.datasets[0].data.push(lastPrice);
            tickerChart.data.datasets[1].data.push(lowestAsk);
            tickerChart.data.datasets[2].data.push(highestBid);
            tickerChart.update();
        }
    }

    function trimChartDataset() {
        while(tickerChart.data.labels.length > maxTickHistory) {
            tickerChart.data.labels.shift();
            tickerChart.data.datasets.forEach((dataset) => {
                dataset.data.shift();
            });
            tickerChart.update();
        }
    }

    function setupChart(currencyPair) {
        var config = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                        type: 'line',
                        label: 'Last Price',
                        backgroundColor: Chart.helpers.color(chartColors.red).alpha(0.5).rgbString(),
                        borderColor: chartColors.red,
                        fill: false,
                        data: [],
                        scale: 1,
                        scaleOverride : true,
                        scaleSteps : 1,
                        scaleStepWidth : 5,
                        scaleStartValue : 0,
                        borderJoinStyle: 'miter'
                }, {
                        type: 'line',
                        label: 'Lowest Ask',
                        backgroundColor: Chart.helpers.color(chartColors.blue).alpha(0.5).rgbString(),
                        borderColor: chartColors.blue,
                        fill: false,
                        data: [],
                        scale: 1,
                        scaleOverride : true,
                        scaleSteps : 1,
                        scaleStepWidth : 5,
                        scaleStartValue : 0,
                        borderJoinStyle: 'miter'
                }, {
                        type: 'line',
                        label: 'Highest Bid',
                        backgroundColor: Chart.helpers.color(chartColors.green).alpha(0.5).rgbString(),
                        borderColor: chartColors.green,
                        fill: false,
                        data: [],
                        scale: 1,
                        scaleOverride : true,
                        scaleSteps : 1,
                        scaleStepWidth : 5,
                        scaleStartValue : 0,
                        borderJoinStyle: 'miter'
                }]
            },
            options: {
                responsive: false,
                title:{
                    text: 'Currency Last Price'
                },
                elements: {
                    line: {
                        tension: 0
                    }
                },
                scales: {
                    xAxes: [{
                        type: 'time',
                        time: {
                            format: 'MM/DD/YYYY HH:mm:ss',
                            tooltipFormat: 'll HH:mm'
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Time Stamp'
                        }
                    }, ],
                    yAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Last Price'
                        }
                    }]
                },
            }
        };
        var ctx = document.getElementById('tickerChart').getContext('2d');
        return new Chart(ctx, config);
    }
}
