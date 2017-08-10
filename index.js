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

// Open the ticker page in the browser
const openurl = require('openurl');

console.log('Opening in browser');
openurl.open('http://localhost:80');

// Subscribe to the ticker
let tickHistory = [];
const maxTickHistory = 25;
const momentFormat = 'MM/DD/YYYY HH:mm:ss';
const pushApi = require('poloniex-api').pushApi;
const moment = require('moment');

console.log('Subscribing to the Poloniex push API');
console.log('This may take a minute...');
var lastTickerMoment = moment();
pushApi.create({ subscriptionName: 'ticker', currencyPair }, (tickerData) => {

    var nowMoment = moment();
    var duration = moment.duration(nowMoment.diff(lastTickerMoment));

    // Protecting against superfluous data
    if(duration.asSeconds() > 1) {
        lastTickerMoment = nowMoment;

        console.log('Ticker data received');
        let tick = {
            moment: nowMoment.format(momentFormat),
            lastPrice: parseFloat(tickerData.lastPrice),
            lowestAsk: parseFloat(tickerData.lowestAsk),
            highestBid: parseFloat(tickerData.highestBid)
        };
        tickHistory.push(tick);
        let averages = calcAverages(tickHistory);

        // Emit to any connected clients
        io.emit('tick', {
            averages,
            tick
        });

        // Trim the history
        if(tickHistory.length > maxTickHistory) {
            tickHistory = tickHistory.slice(tickHistory.length - maxTickHistory, tickHistory.length);
        }
    }
});

/* Convenience function */

function calcAverages(tickHistory) {
    let oneMinuteAgo = moment().subtract(1, 'minute'),
        validTicks = [],
        count = 0,
        sumLastPrices = 0,
        sumLowestAsk = 0,
        sumHighestBid = 0;

    tickHistory.map((tick) => {
        if(moment(tick.moment, momentFormat).isAfter(oneMinuteAgo)) {
            sumLastPrices += tick.lastPrice;
            sumLowestAsk += tick.lowestAsk;
            sumHighestBid += tick.highestBid;
            count++;
        }
    });

    // Returning early
    if(count < 1)
        return null;

    return {
        avgLastPrice: sumLastPrices / count,
        avgLowestAsk: sumLowestAsk / count,
        avgHighestBid: sumHighestBid / count
    };
}