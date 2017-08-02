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
    // Setup the chart
    var config = {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
					type: 'line',
					label: 'Last Price',
					backgroundColor: Chart.helpers.color(window.chartColors.green).alpha(0.5).rgbString(),
					borderColor: window.chartColors.green,
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
                        format: 'MM/DD/YYYY HH:mm',
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
    var tickerChart = new Chart(ctx, config);
    var lastTickMoment = moment().subtract(1, 'minute');
    var socket = io.connect('http://localhost');
    socket.on('tick', function (data) {
        // console.log(data);
        // chartLabels.push(Date.now());
        // chartData.push(parseFloat(data['lastPrice']));
        // console.log(chartData);
        // // socket.emit('my other event', { my: 'data' });

        // Add the latest tick
        var nowMoment = moment();
        var duration = moment.duration(nowMoment.diff(lastTickMoment));
        console.log(duration.asSeconds());
        if(duration.asSeconds() > 1) {
            lastTickMoment = nowMoment;
            tickerChart.data.labels.push(nowMoment);
            tickerChart.data.datasets.forEach((dataset) => {
                dataset.data.push(parseFloat(data['lastPrice']));
            });
            tickerChart.update();
        }

        function addToTickerChart(moment, value) {

        }

        // Remove any outdated ticks
        while(tickerChart.data.labels.length > 25) {
            tickerChart.data.labels.unshift();
            tickerChart.data.datasets.forEach((dataset) => {
                dataset.data.unshift();
            });
            tickerChart.update();
        }
    });
};
