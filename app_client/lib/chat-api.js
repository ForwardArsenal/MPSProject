var io = require('socket.io-client');
var config = require('../../app_server/config');
var events = require('events');
var moment = require('moment');

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
    var formattedTime = moment(Date.now()).format("DD MMM YYYY hh:mm a");
    var message = { userId: self.userId, userName: userName, groupId: groupId, 
    	groupName: groupName, content: content, creationTime: formattedTime };
    self.client.emit('sendMsg', message);
}
/* setup the event handlers upon instantiation of the chat client object */
ChatClient.prototype.setup = function(userId){
	var self = this;
	self.client.on('connect', function(data){
        self.client.emit('registration', {userId: userId});  
        self.client.on('message', function(data){
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
	    self.client.on('msgReply', function(obj){
	    	console.log("The retured status code is "+obj.ret);
	    });      
    });
}
/* retrieve the most recent message */
ChatClient.prototype.getMostRecentMsg = function(){
	var self = this;
    return self.msgStack[self.msgStack.length-1];
}
module.exports = ChatClient;