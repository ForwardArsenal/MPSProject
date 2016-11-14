var async = require('async');
var moment = require('moment');

// constructor of the chat service object
function ChatService(opts){
    this.persistence = opts.persistence;
    this.sockets = opts.sockets;
    this.groupChatModel = this.persistence.getModel('groupChat');
    this.groupModel = this.persistence.getModel('group');
    this.userModel = this.persistence.getModel('user');
}
ChatService.prototype.sendMsg = function(data){
	console.log('running chat service: sendMsg');
    var self = this;
    /*
	var groupChatModel = self.persistence.getModel('groupChat');
	var groupModel = self.persistence.getModel('group');
	var userModel = self.persistence.getModel('user');
    */
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
        				    self.sockets[userId].emit('msgReply', { ret: 2 });
        				    return next(err);
        			    }
        			    senderName = doc.userName;
        			    next();
        		});
            }
        }, 
        // task two: get the receivers
        function(next){
        	self.groupModel.findOne(
        		{ groupId: data.groupId },
        		function(err, doc){
        			if(err) return next(err);
        			if(!doc){
        				err = 3;
        				self.sockets[data.userId].emit('msgReply', { ret: 3 });
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
            // store the message to db
            var formattedTime = moment(data.creationTime).format("DD MMM YYYY hh:mm a");
            var creationTime = data.creationTime+"&"+formattedTime;
            self.groupChatModel.create(
                {
                    groupId: data.groupId,
                    groupName: groupName,
                    senderId: data.userId,
                    senderName: senderName,
                    content: data.content,
                    creationTime: creationTime
                },
                function(err, doc){
                    if(err) return next(err);
                }
            );
        	receivers.forEach(function(id){
        		tasks.push(function(callback){
        			// forward the message
                    if(self.sockets[id]){
        			    self.sockets[id].emit('msgReceived', {
                            groupId: data.groupId,
                            groupName: groupName,
                            senderId: data.userId,
                            senderName: senderName,
                            content: data.content,
                            creationTime: formattedTime  
        			    });
                        console.log("The message has been sent to "+id);
                        callback();
        		    }
        		});
        	});
        	async.parallel(tasks, function(){
                next();
        	});
        }
	],
	function(err){
		if(err) return;
		self.sockets[data.userId].emit('msgReply', { ret: 0 });
	});    
};

ChatService.prototype.joinChatGroup = function(data){
    var self = this;
    var userId = data.userId;
    var groupId = data.groupId;
    self.groupModel
        .findOne({groupId: groupId})
        .exec(function(err, group){
            if(err) console.log(err);
            if(!group.members.includes(userId)){
                group.members.push(userId);
                group.save(function(err, group){
                    if(err) throw err;
                    console.log("User "+userId+" has joined the chat group!");
                });
            }
            else{
                console.log("User "+userId+" is already a member of the chat group!");
            }
            self.sockets[userId].emit('joined', { userId: userId, groupName: group.groupName });
        });
};

ChatService.prototype.fetchHistoryMsg = function(data){
    var self = this;
    var groupId = data.groupId;
    self.groupChatModel.find({groupId: groupId}, function(err, doc){
        if(err) throw err;
        var sortedArr = doc.sort(function(a, b){
            return a.creationTime.split("&")[0]-b.creationTime.split("&")[0];
        });
        var output = [];
        sortedArr.forEach(function(item){
            item.creationTime = item.creationTime.split("&")[1];
            output.push(item);
        });
        if(self.sockets[data.userId]){
            self.sockets[data.userId].emit("historyMsgReceived", output);
        }
    });
};
module.exports = ChatService;