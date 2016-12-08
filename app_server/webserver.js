var express = require('express');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
//var routesAPI = require('./routes/index');
var async = require('async');
var config = require('./config');
var Persistence = require('./models/db');
var OnboardService = require('./services/onboardService');
var PushNotiService = require('./services/pushNotiService');


var persistence;
var onBoardService;
var pushNotiService;

var app = express();
var apiRouter = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


apiRouter.post('/registration', function(req, res){
	var msg = req.body;
	res.set('Content-Type', 'application/json');
	onBoardService.register(msg, res);
});

apiRouter.post('/login', function(req, res){
    var msg = req.body;
    res.set('Content-Type', 'application/json');
    onBoardService.login(msg, res);
});

apiRouter.use(function(req, res, next){
	// rounter middleware to verify token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if(token){
    	// verifies secret and check exp
    	jwt.verify(token, 'secret', function(err, decoded){
    		if(err){
                console.log(err);
    			return res.json({ success: false, message: 'Failed to authenticate the token.' });
    		}
    		else{
    			// if everything is good, save to req for use in other routes
                console.log("authentication success!");
    			req.decoded = decoded;
    			next();
    		}
    	})
    }
    else{
        // if there's no token provided, return an error
        return res.json({
            success: false,
            message: 'No token provided.'
        });
    }
});

apiRouter.post('/group', function(req, res){
    /*
    {
        "school#uncertainty":
        "school#grades":
        "school#time#grades":  
        "school#self-doubt":
        "work#uncertainty#money":
        "work#uncertainty":
        "work#time":
        "relationships#family#conflict":
        "relationships#lonely":
        "relationships#conflict":
        "relationships#time":
        "relationships#grief":
        "home#health":
        "home#money#safety":
        "home#election":
    }
    */
	var tags = req.body.tags;
    var token = req.decoded;
    onBoardService.groupMatching(tags, token, res, 20);
    //res.json({ success: true, msg: 'successfully authenticate the user!' });
});


/*
// register middleware to catch 404 and forward to error handler
app.use(function(req, res, next){
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
*/

app.use('/api', apiRouter);
app.set('port', process.env.PORT || config.webServerPort);


// start the web server and its services
module.exports.start = function(){
    async.series([
        function(next){
        	persistence = new Persistence(function(err){
        		if(err){
        			console.log('webserver: fail to connect to Mongodb');
        			return next(err);
        		}
        		next();
        	});
        },
        function(next){
        	onBoardService = new OnboardService({ db: persistence });
        	console.log("start onboard service");
            next();
        },
        /*
        function(next){
        	pushNotiService = new PushNotiService({ db: persistence });
        	console.log("start push notification service");
        	next();
        }
        */
    ], function(err){
    	if(err){
    		console.error(err);
    		return;
    	}
    }); 
    var server = app.listen(app.get('port'), function(){
	    console.log('Express web server listening on port '+server.address().port);
    });
}


