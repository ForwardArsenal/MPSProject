var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
require('./group');
require('./groupchatMsg');
require('./user');
var config = require('../config');

//var chatDB = mongoose.createConnection(dbURI);
var models = {
	group: mongoose.model('Group'),
	groupChat: mongoose.model('GroupchatMsg'),
	user: mongoose.model('User')
};
var gracefulShutDown = function(msg, callback){
	mongoose.connection.close(function(){
		console.log('Mongoose disconnected through '+msg);
		callback();
	});
}
// listen for SIGNIT emitted on application termination
process.on('SIGINT', function(){
	gracefulShutDown('app termination', function(){
		process.exit(0);
	});
});
// listen for SIGTERM emitted when Heroku shuts down process
process.on('SIGTERM', function(){
	gracefulShutDown('Heroku app shutdown', function(){
		process.exit(0);
	});
});

// constructor of the persistence object
function Persistence(callback){
	this.models = models;
    this.connect(function(err){
    	if(err) return callback(err);
    	callback();
    });
}

Persistence.prototype.connect = function(cb){
	var dbURI;
	if(process.env.NODE_ENV === 'production'){
		dbURI = process.env.MONGODB_URI;
	}
	else{
		dbURI = config.localDbURI;
	}
	mongoose.connect(dbURI, cb);
}

Persistence.prototype.getModel = function(modelName){
	return this.models[modelName];
}
/* Listen for Mongoose connection events and output the statuses to console */
mongoose.connection.on('connected', function(){
	if(process.env.NODE_ENV === 'production'){
		console.log('Mongoose connected to '+process.env.MONGODB_URI);
	}
	else{
	    console.log('Mongoose connected to '+config.localDbURI);
    }
});

mongoose.connection.on('error', function(err){
	console.log('Mongoose connection error'+err);
});

mongoose.connection.on('disconnected', function(){
	console.log('Mongoose disconnected');
});

module.exports = Persistence;

