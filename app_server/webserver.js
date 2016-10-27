var express = require('express');
var bodyParser = require('body-parser');
var routesAPI = require('./routes/index');
var config = require('./config');

var app = express();

app.use(bodyParser.json());

app.use('/api', routesAPI);

// register middleware to catch 404 and forward to error handler
app.use(function(req, res, next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.set('port', process.env.PORT || config.webServerPort);

// start the web server
module.exports.start = function(){
    var server = app.listen(app.get('port'), function(){
	    console.log('Express web server listening on port '+server.address().port);
    });
}