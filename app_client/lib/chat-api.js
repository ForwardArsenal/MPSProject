var io = require('socket.io-client');
var config = require('../../app_server/config');
var events = require('events');

var options = {
    transports: ['websocket'],
	'force new connection': true
};

// constructor of the chat client object
function ChatClient(userId){
	this.io = require('socket.io-client');
	this.client = io.connect(config.chatServerURL, options);
	this.userId = userId;
	this.setup(userId);
	this.msgStack = [];
	this.eventEmitter = new events.EventEmitter();
	(function(arr, eventEmitter, callback){
	    arr.push = function(e){
		    Array.prototype.push.call(arr, e);
		    callback(eventEmitter);
	    };
    })(this.msgStack, this.eventEmitter, this.getMostRecentMsg);
}

ChatClient.prototype.sendMessage = function(userName, groupId, groupName, msgContent){
    var self = this;
    var message = { userId: self.userId, userName: userName, groupId: groupId, 
    	groupName: groupName, msgContent: msgContent };
    self.client.emit('sendMsg', message);
}
ChatClient.prototype.setup = function(userId){
	var self = this;
	self.client.on('connect', function(data){
        self.client.emit('registration', {userId: userId});  
        self.client.on('message', function(data){
        	//console.log("The returned data is "+data.content);
        	var msg = {
        		groupId: data.groupId,
        		userId: data.senderId,
        		userName: data.senderName,
        		content: data.content
        	}
            self.msgStack.push(msg);
	    });
	    self.client.on('msgReply', function(obj){
	    	console.log("The retured status code is "+obj.ret);
	    });      
    });
}
ChatClient.prototype.getMostRecentMsg = function(eventEmitter){
    eventEmitter.emit('newMsgReceived');
    //console.log("The new array length is "+arr.length);
}
module.exports = ChatClient;