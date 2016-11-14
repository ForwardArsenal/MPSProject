var async = require('async');
var uuid = require('uuid');
var jwt = require('jsonwebtoken');
var kNN = require('./knn');

var statusCode = {
    '0': 'success',
    '1': 'error occurred when inserting the new user document into db',
    '2': 'error occurred when accessing the user collection',
    '3': 'provided user is not found in db',
    '4': 'error occurred when inserting the new group document into db',
    '5': 'error occurred when updating the members field of group document',
    '6': 'error occurred when retrieving the group document',
    '7': 'error occurred when updating the groupId field of user document'
};

var handleError = function(ret, res){
	var reply = {};
	reply.ret = ret;
	reply.msg = statusCode.ret;
	res.send(reply);
}
function OnboardService(opts){
	this.db = opts.db;
	this.UserModel = this.db.getModel('user');
	this.GroupModel = this.db.getModel('group');
	this.knn = new kNN(5);
}
// user registration

OnboardService.prototype.register = function(msg, res){
    var self = this;
    var userId = uuid.v1();
    var user = {
        userId: userId,
        userName: msg.userName,
        password: msg.password,
    };
    var reply = {};
    var userDocument = new self.UserModel(user);
    userDocument.save(function(err){
    	if(err){
    		console.log(err);
    		handleError(1, res);
    	}
    	// generate token
    	var token = jwt.sign(user, 'secret', { expiresIn: '2 days' });
    	reply.token = token;
    	reply.ret = 0;
    	reply.msg = statusCode['0'];
    	res.send(reply);
    });
};

OnboardService.prototype.login = function(msg, res){
    var self = this;
    var reply = {};
    self.UserModel.findOne({ userName: msg.userName, password: msg.password }, function(err, user){
        if(err){
        	console.log(err);
            handleError(2, res);
        }
        if(!user){
        	handleError(3, res);
        }
        else{
        	// create a new token upon user login
        	var token = jwt.sign(user, 'secret', { expiresIn: '2 days' });  // expires in 24 hours
            reply.ret = 0;
            reply.msg = statusCode['0'];
            reply.token = token;
            res.send(reply);
        }
    });
}
var knnMatching = function(tags, userId, GroupModel, UserModel, res){
	var reply = {};
	var userVector = [];
	for(var tagName : tags){
		userVector.push(tags[tagName]);
	}
	var selectedTag = 
	UserModel.find({}, function(err, users){
		if(err){
			console.log(err);
			handleError(2, res);
			return;
		}
		users.forEach(function(user){
			knn.learn(user.vector, user.groupId);
		});
		var resGroupId = knn.classify(userVector);
		GroupModel.findOne({ groupId: resGroupId }, function(err, group){
			group.members.push(userId);
			group.save(function(err){
				if(err){
					console.
				}
			});
		});
        
	});
};
var normalMatching = function(tags, userId, GroupModel, UserModel, res){
	var reply = {};
	var arr = [];
	var userVector = [];
	// iterate through the tags and get the tag whose corresponding value is the highest
	// the selected tag name represents the group that the user should join.
	var selectedTagName;
	var max = 0;
    for(var tagName in tags){
    	if(tags[tagName]>max){
    		max = tags[tagName];
    		selectedTagName = tagName;
    	}
    	userVector.push(tags[tagName]);
    }
    var groupId;
    GroupModel.find({ groupName: selectedTagName }, function(err, group){
    	if(err){
    		console.log(err);
    		handleError(6, res);
    		return;
    	}
    	if(!group){
    		// no existing group that matches the selected tag name
    		groupId = uuid.v1();
    		var group = {
    			groupId: groupId,
    			groupName: selectedTagName,
    			members: [userId]
    		}
    		var groupDocument = new GroupModel(group);
    		groupDocument.save(function(err){
    			if(err){
    				console.log(err);
                    handleError(4, res);
                    return;
    			}
    		});
    	}
    	else{
    		// an existing group is found, update its 'members' field
    		groupId = group.groupId;
    		group.members.push(userId);
    		group.save(function(err){
    			if(err){
    				console.log(err);
    				handleError(5, res);
    				return;
    			}
    		});
    	}
    });
    UserModel.find({ userId: userId }).exec(function(err, user){
    	if(err){
    		console.log(err);
    		handleError(2, res);
    		return;
    	}
    	if(!user){
    		console.log("No matching user is found!");
    		handleError(3, res);
    		return;
    	}
    	else{
            user.groupId = groupId;
            user.vector = userVector;
            user.save(function(err){
            	if(err){
            		console.log(err);
            		handleError(7, res);
            		return;
            	}
            });
            // generate new token
            var token = jwt.sign(user, 'secret', { expiresIn: '2 days' });
            reply.ret = 0;
            reply.msg = statusCode['0'];
            reply.token = token;
            res.send(reply);
    	}
    });
};
OnboardService.prototype.groupMatching = function(tags, token, res, threshold){
	var self = this;
    var userId = token.userId;
    var userName = token.userName;
    self.UserModel.count({}, function(err, count){
        if(err){
        	console.log(err);
        	handleError(2, res);
        	return;
        }
        if(count<=threshold){
        	normalMatching(tags, userId, self.GroupModel, self.UserModel, res);
        }
        else{

        }
    });
}
