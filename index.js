// Process the command line args

const commandLineArgs = require('command-line-args');
const optionDefinitions = [
    { name: 'currencyPair', alias: 'c', type: String }
];
const options = commandLineArgs(optionDefinitions);
const currencyPair = options['currencyPair'].replace('/', '_');
console.log(`Currency Pair: ${currencyPair}`);

// Start the express server

var express    = require('express');
var app        = express();                               // create our app w/ express
var bodyParser = require('body-parser');    // pull information from HTML POST (express4)

app.use(express.static(__dirname + '/public'));                 // static files
app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
app.use(bodyParser.json());                                     // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json

app.listen(8080);
console.log("Express app listening on port 8080");
