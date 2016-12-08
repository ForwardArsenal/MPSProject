var io = require('socket.io-client');
var events = require('events');
var config = require('../../app_server/config');
//var liveChatServerURL = "https://agile-savannah-12064.herokuapp.com";
//var jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZDNlZjA3MC1iMGZhLTExZTYtODBkOS03OTBlNjBmZjkwY2MiLCJ1c2VyTmFtZSI6IkVuem8xMjMiLCJwYXNzd29yZCI6IjA5ODc2IiwiaWF0IjoxNDc5ODUwMTY0LCJleHAiOjE0ODAwMjI5NjR9.FEBJHS-07_juaxkW5rfOEGMKDM2jz-T3dXpFD3TEwPs";
//var expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJhYTc1ODU4MC1iMGZhLTExZTYtODBkOS03OTBlNjBmZjkwY2MiLCJ1c2VyTmFtZSI6IlphY2gxMjMiLCJwYXNzd29yZCI6IjAxMjMzIiwiaWF0IjoxNDc5ODUwMTMyLCJleHAiOjE0ODAwMjI5MzJ9.XER5qntHEeTRnZqW4Z9znwBSohPGCiZ-gGxKp8pm_98";
//var cur_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjNmUzZWE5MC1iOGFjLTExZTYtYTE5OS02M2IyM2UyYzIwNDciLCJ1c2VyTmFtZSI6IkhpbGxhcnlDbGludG9uIiwicGFzc3dvcmQiOiIxMjM0NSIsImlhdCI6MTQ4MDk1MzU3OCwiZXhwIjoxNDgxMTI2Mzc4fQ.2PNCMuHfDWfhCmDWPdt4122I7rUavR1cpBM48c6YxR0";


// constructor of the chat client object
function ChatClient(token){
    var options = {
        transports: ['websocket'],
        'force new connection': true,
        query: 'auth_token='+token
    };
	//this.io = require('socket.io-client');
	if(process.env.NODE_ENV === 'production'){
		this.client = io.connect(config.liveChatServerURL, options);
	}
    else{
    	this.client = io.connect(config.localChatServerURL, options);
    	//var jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJiZDNlZjA3MC1iMGZhLTExZTYtODBkOS03OTBlNjBmZjkwY2MiLCJ1c2VyTmFtZSI6IkVuem8xMjMiLCJwYXNzd29yZCI6IjA5ODc2IiwiaWF0IjoxNDc5ODUwMTY0LCJleHAiOjE0ODAwMjI5NjR9.FEBJHS-07_juaxkW5rfOEGMKDM2jz-T3dXpFD3TEwPs";
    	//this.client = io(config.localChatServerURL, { query: 'auth_token='+jwt_token });
    }
	//this.userId = userId;
	//this.groupId = groupId;
	this.setup();
	this.msgStack = [];
	this.eventEmitter = new events.EventEmitter();
	/* make the msgStack observable by defining an event which is going to be fired
	when new message is pushed onto the stack, and registering a listener for the event. */
	(function(arr, eventEmitter, callback){
	    arr.push = function(e){
		    Array.prototype.push.call(arr, e);
		    callback(eventEmitter);
	    };
    })(this.msgStack, this.eventEmitter, function(em){
        em.emit('newMsgReceived');
    });
}

ChatClient.prototype.sendMessage = function(content){
    var self = this;
    //var curTime = Date.now();
    var curTime = Date.now();
    var message = { content: content, creationTime: curTime };   
    self.client.emit('sendMsg', message);
}
/* setup the event handlers upon instantiation of the chat client object */
ChatClient.prototype.setup = function(){
	var self = this;
	// Authentication failed
	self.client.on('error', function(err){
		//throw new Error(err);
		console.log(err);
	});
	self.client.on('connect', function(data){
        self.client.emit('joinChatGroup');  
        self.client.on('msgReceived', function(data){
        	var msg = {
        		groupId: data.groupId,
        		groupName: data.groupName,
        		userId: data.senderId,
        		userName: data.senderName,
        		content: data.content,
        		creationTime: data.creationTime
        	}
            self.msgStack.push(msg);
	    });
	    /*
	    self.client.on('msgReply', function(obj){
	    	console.log("The retured status code is "+obj.ret);
	    });
	    */  
	    self.client.on('joined', function(data){
	    	console.log("User "+data.userName+" has joined the chat group "+data.groupName+"!");
	    });    
    });
}
/* retrieve the most recent message */
ChatClient.prototype.getMostRecentMsg = function(){
	var self = this;
    return self.msgStack[self.msgStack.length-1];
}
ChatClient.prototype.ready = function(){
	var self = this;
	return self.eventEmitter;
}
ChatClient.prototype.fetchHistoryMsg = function(){
    var self = this;
    self.client.emit('fetchHistoryMsg');
    self.client.on('historyMsgReceived', function(msgs){
    	console.log(msgs);
    });
}
module.exports = ChatClient;