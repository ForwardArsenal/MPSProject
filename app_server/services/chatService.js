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
ChatService.prototype.sendMsg = function(token, msg){
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
    var senderId = token.userId;
	var senderName = token.userName;
    var groupId = token.groupId;
	var groupName;
    var content = msg.content;

	async.series([
        
        // task one: get the receivers
        function(next){
        	self.groupModel.findOne(
        		{ groupId: groupId },
        		function(err, doc){
        			if(err) return next(err);
        			if(!doc){
        				err = 3;
        				self.sockets[senderId].emit('msgReply', { ret: 3 });
        				return next(err);
        			}
        			groupName = doc.groupName;
        			if(doc.members){
        				doc.members.forEach(function(id){
        					if(id!=senderId) receivers.push(id);
        				});
        			}
        			next();
        		});
        },
        // task two: forward the message to the receivers, and store the message to db
        function(next){
        	var tasks = [];
            console.log('the retrieved receivers are '+receivers);
            // store the message to db
            var formattedTime = moment(msg.creationTime).format("DD MMM YYYY hh:mm a");
            var creationTime = msg.creationTime+"&"+formattedTime;
            /*
            var dateObj = new Date(data.creationTime);
            var formattedTime = moment(dateObj).format("DD MMM YYYY hh:mm a");
            var creationTime = dateObj.getTime()+"&"+formattedTime;
            */
            self.groupChatModel.create(
                {
                    groupId: groupId,
                    groupName: groupName,
                    senderId: senderId,
                    senderName: senderName,
                    content: content,
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
                            groupId: groupId,
                            groupName: groupName,
                            senderId: senderId,
                            senderName: senderName,
                            content: content,
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
		self.sockets[senderId].emit('msgReply', { ret: 0 });
	});    
};

ChatService.prototype.joinChatGroup = function(token){
    var self = this;
    var userId = token.userId;
    var groupId = token.groupId;
    var userName = token.userName;
    self.groupModel
        .findOne({groupId: groupId})
        .exec(function(err, group){
            if(err) console.log(err);
            var tasks = [];
            group.members.forEach(function(id){
                if(self.sockets[id] && id!=userId){
                    tasks.push(function(callback){
                        // notify all the other group members within that group, a new user with
                        // userId and groupName has just joined the group
                        self.sockets[id].emit('joined', { userName: userName, groupName: group.groupName });
                        callback();
                    });
                }
            });
            async.parallel(tasks, function(err){ if(err) console.log(err); });
        });
};

ChatService.prototype.fetchHistoryMsg = function(token){
    var self = this;
    var userId = token.userId;
    var groupId = token.groupId;
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
        if(self.sockets[userId]){
            self.sockets[userId].emit("historyMsgReceived", output);
        }
    });
};
module.exports = ChatService;