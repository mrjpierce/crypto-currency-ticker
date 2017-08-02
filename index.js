var tickHistory = [];
const maxTickHistory = 25;
var moment = require('moment');

// Process the command line args
const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'currencyPair', alias: 'c', type: String }
];
const options = commandLineArgs(optionDefinitions);

const currencyPair = options['currencyPair'].replace('/', '_');
console.log(`Currency Pair: ${currencyPair}`);

// Start the express server
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(80);

app.use(express.static(__dirname + '/public'));  
app.use('/bower_components', express.static(__dirname + '/bower_components'));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.emit('init', {
        currencyPair,
        tickHistory
    });
});

// Open the ticker in the browser
const openurl = require('openurl');

console.log('Opening in browser');
openurl.open('http://localhost:80');

// Subscribe to the ticker
const pushApi = require('poloniex-api').pushApi;

console.log('Subscribing to the Poloniex push API');
console.log('This may take a minute...');
var lastTickerMoment = moment();
pushApi.create({ subscriptionName: 'ticker', currencyPair }, (tickerData) => {
    
    var nowMoment = moment();
    var duration = moment.duration(nowMoment.diff(lastTickerMoment));
    if(duration.asSeconds() > 1) {
        lastTickerMoment = nowMoment;
        var tickerUpdate = {
            moment: nowMoment.format('MM/DD/YYYY HH:mm:ss'),
            lastPrice: tickerData['lastPrice']
        };
        tickHistory.push(tickerUpdate);

        // Emit to any connected clients
        io.emit('tick', tickerUpdate);

        // Trim the history
        if(tickHistory.length > maxTickHistory) {
            tickHistory = tickHistory.slice(tickHistory.length - maxTickHistory, tickHistory.length);
        }
    }
});
