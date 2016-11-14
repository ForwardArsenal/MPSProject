var express = require('express');
var apiRouter = express.Router();
var ctrlMain = require('../controllers/main');
var Persistence = require('../models/db');

var persistence = new Persistence(function(err){
    if(err) console.log('webserver: fail to connect to Mongodb');
});

/* GET home page. */
apiRouter.get('/', function(req, res){
	res.json({ message: "Welcome!" });
});

apiRouter.post('/registration', );

module.exports = router;
