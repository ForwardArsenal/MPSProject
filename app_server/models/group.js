var mongoose = require('mongoose');

// define the schema for the groupchat collection
/*
var groupSchema = new mongoose.Schema({
	groupId: { type: String, required: true }, // type should be String
	groupName: { type: String, required: true },
    members: { type: [String], required: true }
});
*/
// schema for chat service
var groupSchema = new mongoose.Schema({
	groupId: { type: String, required: true }, // type should be String
	groupName: { type: String, required: true },
    members: { type: [String], required: true }  // type should be String
});

// compile the schema into models
mongoose.model('Group', groupSchema);