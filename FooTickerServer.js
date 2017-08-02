let moment = require('moment');
const pushApi = require('poloniex-api').pushApi;

class TickerServer {

    constructor(socketServer, currencyPair) {
        this.tickHistory = [];
        this.maxTickHistory = 25;
        this.momentFormat = 'MM/DD/YYYY HH:mm:ss';
        this.socketServer = socketServer;
        this.currencyPair = currencyPair;

        this.initSocketServer();
    }

    initSocketServer() {
        this.socketServer.on('connection', (socket) => {
            socket.emit('init', {
                currencyPair: this.currencyPair,
                tickHistory: this.tickHistory
            });
        });
    }

    subscribeToPushAPI() {
        console.log('Subscribing to the Poloniex push API');
        console.log('This may take a minute...');
        let lastTickerMoment = moment();
        pushApi.create({ subscriptionName: 'ticker', currencyPair: this.currencyPair }, (tickerData) => {

            let nowMoment = moment();
            let duration = moment.duration(nowMoment.diff(lastTickerMoment));

            // Protecting against superfluous data
            if(duration.asSeconds() > 1) {
                lastTickerMoment = nowMoment;
                console.log('Ticker data received');

                // Process the ticker data
                let tick = {
                    moment: nowMoment.format(momentFormat),
                    lastPrice: parseFloat(tickerData.lastPrice),
                    lowestAsk: parseFloat(tickerData.lowestAsk),
                    highestBid: parseFloat(tickerData.highestBid)
                };
                this.tickHistory.push(tick);
                // let averages = this.calcAverages(this.tickHistory);

                // Emit to any connected clients
                this.socketServer.emit('tick', {
                    averages: null,
                    tick
                });

                // Trim the history
                if(this.tickHistory.length > maxTickHistory) {
                    this.tickHistory = this.tickHistory.slice(this.tickHistory.length - maxTickHistory, this.tickHistory.length);
                }
            }
        });
    }

    calcAverages(tickHistory) {
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
}

module.exports.TickerServer = TickerServer;