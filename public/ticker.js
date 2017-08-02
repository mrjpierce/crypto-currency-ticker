window.onload = function() {
    const maxTickHistory = 25; // Max count of ticks we will display
    var tickerChart = null;

    var socket = io.connect('http://localhost');

    socket.on('init', function(tickerInit) {
        // Setup the chart
        tickerChart = setupChart(tickerInit['currencyPair']);

        tickerInit.tickHistory.forEach((value) => {
            addTickerUpdate(value);
        });
    });

    socket.on('tick', function(tickerUpdate) {
        // Add the latest tick
        addTickerUpdate(tickerUpdate);
        
        // Remove any outdated ticks
        trimChartDataset();
    });

    function addTickerUpdate(tickerUpdate) {
        if(tickerChart) {
            let lastPrice = parseFloat(tickerUpdate['lastPrice']);
            tickerChart.data.labels.push(tickerUpdate['moment']);
            tickerChart.data.datasets.forEach((dataset) => {
                dataset.data.push(lastPrice);
            });
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
                        label: `${currencyPair} Last Price`,
                        backgroundColor: Chart.helpers.color('rgb(75, 192, 192)').alpha(0.5).rgbString(),
                        borderColor: 'rgb(75, 192, 192)',
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
