var io = require('socket.io-client');
var events = require('events');
var config = require('../../app_server/config');
//var liveChatServerURL = "https://agile-savannah-12064.herokuapp.com";
var options = {
    transports: ['websocket'],
	'force new connection': true
};

// constructor of the chat client object
function ChatClient(userId, groupId){
	//this.io = require('socket.io-client');
	if(process.env.NODE_ENV === 'production'){
		this.client = io.connect(config.liveChatServerURL, options);
	}
    else{
    	this.client = io.connect(config.localChatServerURL, options);
    }
	this.userId = userId;
	this.groupId = groupId;
	this.setup(userId);
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

ChatClient.prototype.sendMessage = function(userName, groupId, groupName, content){
    var self = this;
    var curTime = Date.now();
    var message = { userId: self.userId, userName: userName, groupId: groupId, 
    	groupName: groupName, content: content, creationTime: curTime };
    self.client.emit('sendMsg', message);
}
/* setup the event handlers upon instantiation of the chat client object */
ChatClient.prototype.setup = function(userId){
	var self = this;
	self.client.on('connect', function(data){
        self.client.emit('joinChatGroup', {userId: userId, groupId: self.groupId});  
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
	    	console.log("User "+data.userId+" has joined the chat group "+data.groupName+"!");
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
ChatClient.prototype.fetchHistoryMsg = function(groupId, userId){
    var self = this;
    self.client.emit('fetchHistoryMsg', { groupId: groupId, userId: userId });
    self.client.on('historyMsgReceived', function(data){
    	console.log(data);
    });
}
module.exports = ChatClient;