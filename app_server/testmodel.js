var Persistence = require('./models/db');

var persistence = new Persistence(function(err){
	if(err) console.error('chat server: fail to connect to mongodb');
});

//console.log(persistence.models.group);
var groupModel = persistence.getModel('group');
groupModel.create({
	groupId: 1,
	groupName: 'stress',
	members: [1, 2, 3, 4]
}, function(err, doc){
	if(err) console.log(err);
});
/*
groupModel.findOne({groupID: 1}, function(err, doc){
    if(err) console.log(err);
    if(!doc){
    	console.log('there is no such document');
    }
    else{
        console.log(doc);
    }
});
*/

