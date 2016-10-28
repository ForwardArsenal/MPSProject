var async = require('async');
var moment = require('moment');

// constructor of the chat service object
function ChatService(opts){
    this.persistence = opts.persistence;
    this.sockets = opts.sockets;
}
ChatService.prototype.sendMsg = function(data, socket){
	console.log('running chat service: sendMsg');
    var self = this;
	var groupChatModel = self.persistence.getModel('groupChat');
	var groupModel = self.persistence.getModel('group');
	var userModel = self.persistence.getModel('user');
	var receivers = [];
	/* schema for the group chat model
    groupId, groupName, senderId, senderName, msgContent
	*/
	var senderName;
	var groupName;

	async.series([
        // task one: find user name
        function(next){
            if(data.userName){
                senderName = data.userName;
                next();
            }
            else{
        	    userModel.findOne(
        		    { userId: data.userId }, 
        		    function(err, doc){
        			    if(err) return next(err);
        			    if(!doc){
        				    err = 2;
        				    socket.emit('msgReply', { ret: 2 });
        				    return next(err);
        			    }
        			    senderName = doc.userName;
        			    next();
        		});
            }
        }, 
        // task two: get the receivers
        function(next){
        	groupModel.findOne(
        		{ groupId: data.groupId },
        		function(err, doc){
        			if(err) return next(err);
        			if(!doc){
        				err = 3;
        				socket.emit('msgReply', { ret: 3 });
        				return next(err);
        			}
                    if(data.groupName){
                        groupName = data.groupName;
                    }
                    else{
        			    if(doc.groupName) groupName = doc.groupName;
                    }
        			if(doc.members){
        				doc.members.forEach(function(id){
        					if(id!=data.userId) receivers.push(id);
        				});
        			}
        			next();
        		});
        },
        // task three: forward the message to the receivers, and store the message to db
        function(next){
        	var tasks = [];
            console.log('the retrieved receivers are '+receivers);
        	receivers.forEach(function(id){
        		tasks.push(function(callback){
        			// forward the message
                    var formattedTime = moment(data.creationTime).format("DD MMM YYYY hh:mm a");
                    if(self.sockets[id]){
        			    self.sockets[id].emit('message', {
                            groupId: data.groupId,
                            groupName: groupName,
                            senderId: data.userId,
                            senderName: senderName,
                            content: data.content,
                            creationTime: formattedTime  
        			    });
                        console.log("The message has been sent to "+id);
        		    }
        		    // store the message to db
        		    groupChatModel.create(
        		    	{
        		    		groupId: data.groupId,
        		    		groupName: groupName,
        		    		senderId: data.userId,
        		    		senderName: senderName,
                            receiverId: id,
        		    		content: data.content,
                            creationTime: formattedTime
        		    	},
        		    	function(err, doc){
                            if(err) return next(err);
                            console.log("For "+id+", the new message has been inserted to db");
                            callback();
        		    	}
        		    );
        		});
        	});
        	async.parallel(tasks, function(){
                next();
        	});
        }
	],
	function(err){
		if(err) return;
		socket.emit('msgReply', { ret: 0 });
	});    
};

module.exports = ChatService;