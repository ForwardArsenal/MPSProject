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
	reply.msg = statusCode[ret];
	res.send(reply);
}
function OnboardService(opts){
	this.db = opts.db;
	this.UserModel = this.db.getModel('user');
	this.GroupModel = this.db.getModel('group');
	this.knn = new kNN(2);
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
            var userClaims = {};
            userClaims.userId = user.userId;
            userClaims.userName = user.userName;
            userClaims.password = user.password;
            if(user.groupId) userClaims.groupId = user.groupId;
        	var token = jwt.sign(userClaims, 'secret', { expiresIn: '2 days' });  // expires in 24 hours
            reply.ret = 0;
            reply.msg = statusCode['0'];
            reply.token = token;
            res.send(reply);
        }
    });
}
var knnMatching = function(knn, tags, userId, GroupModel, UserModel, res){
	var reply = {};
	var userVector = [];
    var curUser;
    var groupName;
    var groupMembersId = [];
    var groupMembersName = [];
	for(var tagName in tags){
		userVector.push(tags[tagName]);
	}
	UserModel.find({}, function(err, users){
		if(err){
			console.log(err);
			handleError(2, res);
			return;
		}
		users.forEach(function(user){
            if(user.userId == userId){
                curUser = user;
            }
            else{
			    knn.learn(user.vector, user.groupId);
            }
		});
		var resGroupId = knn.classify(userVector);
        console.log("The result groupId is "+resGroupId);
        async.series([
            function(next){
                GroupModel.findOne({ groupId: resGroupId }, function(err, group){
                    if(err) return next(err);
                    if(!group){
                        console.log("No matching group!");
                        return;
                    }
                    else{
                        console.log("The groupName is "+group.groupName);
                        groupName = group.groupName;
                        if(!group.members.includes(userId)){
                            group.members.push(userId);
                        }
                        group.members.forEach(function(member){
                            groupMembersId.push(member);
                        });
                        group.save(function(err){
                            if(err){
                                console.log(err);
                                return;
                            }
                        });
                        next();
                    }
                });
            },
            function(next){
                var tasks = [];
                groupMembersId.forEach(function(id){
                    tasks.push(function(cb){
                        UserModel.findOne({ userId: id}, function(err, user){
                            if(err) return next(err);
                            groupMembersName.push(user.userName);
                            cb();
                        });
                    });
                });
                async.parallel(tasks, function(){
                    next();
                });
            },
            function(next){
                // update the groupId and the vector field of the current user
                curUser.groupId = resGroupId;
                curUser.vector = userVector;
                curUser.save(function(err){
                    if(err){
                        console.log(err);
                        return next(err);
                    }
                });
                // generate new token for the current user
                var userClaims = {};
                userClaims.userId = curUser.userId;
                userClaims.userName = curUser.userName;
                userClaims.password = curUser.password;
                userClaims.groupId = curUser.groupId;
                var token = jwt.sign(userClaims, 'secret', { expiresIn: '2 days' });
                reply.ret = 0;
                reply.msg = statusCode['0'];
                reply.token = token;
                reply.groupName = groupName;
                reply.groupMembers = groupMembersName;
                res.send(reply);
                next();
            }
        ], function(err){
            if(err) console.log(err);
            return;
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
    var groupName;
	var max = 0;
    var groupMembersId = [];
    var groupMembersName = [];
    for(var tagName in tags){
    	if(tags[tagName]>max){
    		max = tags[tagName];
    		selectedTagName = tagName;
    	}
    	userVector.push(tags[tagName]);
    }
    console.log("The selected tagName is "+selectedTagName);
    var groupId;
    async.series([
        function(next){
            GroupModel.findOne({ groupName: selectedTagName }, function(err, group){
                if(err){
                    console.log(err);
                    handleError(6, res);
                    return;
                }
                if(!group){
                    // no existing group that matches the selected tag name
                    console.log("no existing group that matches the selected tag name!");
                    groupId = uuid.v1();
                    groupName = selectedTagName;
                    var group = {
                        groupId: groupId,
                        groupName: selectedTagName,
                        members: [userId]
                    }
                    groupMembersId.push(userId);
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
                    console.log("an existing group is found, update its 'members' field");
                    groupId = group.groupId;
                    groupName = group.groupName;
                    if(!group.members.includes(userId)){
                        group.members.push(userId);
                    }
                    group.members.forEach(function(id){
                        groupMembersId.push(id);
                    });
                    group.save(function(err){
                        if(err){
                            console.log(err);
                            handleError(5, res);
                            return;
                        }
                    });
                }
                next();   
            });        
        },
        function(next){
            var tasks = [];
            groupMembersId.forEach(function(id){
                tasks.push(function(cb){
                    UserModel.findOne({ userId: id}, function(err, user){
                        if(err) return next(err);
                        groupMembersName.push(user.userName);
                        cb();
                    });
                });
            });
            async.parallel(tasks, function(){
                next();
            });
        },
        function(next){
            UserModel.findOne({ userId: userId }).exec(function(err, user){
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
                    console.log("Matching user is found!");
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
                    var userClaims = {};
                    userClaims.userId = user.userId;
                    userClaims.userName = user.userName;
                    userClaims.password = user.password;
                    userClaims.groupId = user.groupId;
                    var token = jwt.sign(userClaims, 'secret', { expiresIn: '2 days' });
                    console.log("A new token with updated info is generated!");
                    reply.ret = 0;
                    reply.msg = statusCode['0'];
                    reply.token = token;
                    reply.groupName = groupName;
                    reply.groupMembers = groupMembersName;
                    res.send(reply);
                    next();
                }
            });
        }
    ], function(err){
        if(err) console.log(err);
        return;
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
        console.log("There are "+count+" registered users.");
        if(count<=threshold){
            console.log("Start normal matching!");
        	normalMatching(tags, userId, self.GroupModel, self.UserModel, res);
        }
        else{
            console.log("Start kNN matching!");
            knnMatching(self.knn, tags, userId, self.GroupModel, self.UserModel, res);
        }
    });
}
module.exports = OnboardService;
