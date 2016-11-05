var async = require('async');
var ChatService = require('./services/chatService');
var Persistence = require('./models/db');
var config = require('./config');

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
	var httpServer = require('http').createServer();
	var chatServer = require('socket.io')(httpServer);
    httpServer.listen(process.env.PORT || config.chatServerPort, function(){
    	console.log('chat server listens at port %d', process.env.PORT || config.chatServerPort);
    });
    chatServer.on('connection', function(socket){
    	var userId;
    	// register listener for the registration event
    	// trigger the event only when the connection between client and server has been established for the first time.
    	socket.on('joinChatGroup', function(data){
            console.log('a new client with userId=%d is now connected with the chat server', data.userId);
            if(!sockets[data.userId]){
                userId = data.userId;
                sockets[data.userId] = socket;
            }
            chatService.joinChatGroup(data, socket);
    	});
    	// register listener for the sendMsg event
    	socket.on('sendMsg', function(data){
            chatService.sendMsg(data, socket);
    	});
        // register listener for the fetchHistoryMsg
        socket.on('fetchHistoryMsg', function(data){
            chatService.fetchHistoryMsg(data, socket);
        });
    	// register listener for the disconnect event
    	socket.on('disconnect', function(){
    	    console.log('userId=%d disconnected!', userId);
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
