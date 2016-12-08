var async = require('async');
var io = require('socket.io')
var http = require('http');
var ChatService = require('./services/chatService');
var Persistence = require('./models/db');
var config = require('./config');
//var jwtAuth = require('socketio-jwt-auth');
var jwt = require('jsonwebtoken');

var sockets = {};
var chatService;
var persistence;
/* implement the sequence of tasks to perform upon chat server setup*/
var dbConnect = function(next){
    persistence = new Persistence(function(err){
        if(err){
        	console.error('chat server: fail to connect to mongodb');
        	return next(err);
        }
        next();
    });
}

var startChatService = function(next){
    chatService = new ChatService({ persistence: persistence, sockets: sockets});
    next();
}

var startChatServer = function(next){
	var httpServer = http.createServer();
	var chatServer = io(httpServer);
    httpServer.listen(process.env.PORT || config.chatServerPort, function(){
    	console.log('chat server listens at port %d', process.env.PORT || config.chatServerPort);
    });
    // register middleware to handle authentication
    chatServer.use(function(socket, next){
        //console.log("Query: "+socket.handshake);
        var token = socket.handshake.query.auth_token;
        if(token){
            // verifies secret and check exp
            jwt.verify(token, 'secret', function(err, decoded){
                if(err){
                    next(new Error(err));
                }
                else{
                    // if everything is good, save to req for use in other routes
                    console.log("authentication success!");
                    socket.decoded = decoded;
                    next();
                }
            })
        }   
        else{
            // if there's no token provided, return an error
            next(new Error('No token provided'));
        }
    });
    chatServer.on('connection', function(socket){
        var token = socket.decoded;
        var userId = token.userId;
        //console.log(token.userName);
    	// register listener for the registration event
    	// trigger the event only when the connection between client and server has been established for the first time.
    	socket.on('joinChatGroup', function(){
            console.log('a new client with userId=%s is now connected with the chat server', userId);
            if(!sockets[userId]){
                sockets[userId] = socket;
            }
            chatService.joinChatGroup(token);
    	});
    	// register listener for the sendMsg event
    	socket.on('sendMsg', function(msg){
            chatService.sendMsg(token, msg);
    	});
        // register listener for the fetchHistoryMsg
        socket.on('fetchHistoryMsg', function(){
            chatService.fetchHistoryMsg(token);
        });
    	// register listener for the disconnect event
    	socket.on('disconnect', function(){
    	    console.log('userId=%s disconnected!', userId);
    		if(sockets[userId]){
                sockets[userId].disconnect(true);
                delete sockets[userId];
            }
    	});
    });
    next();
}

// start a http long connection based server
module.exports.start = function(argv){
	async.series([
        dbConnect,
        startChatService,
		startChatServer
	], 
	function(err){
		if(err) console.log(err);
	});
}
