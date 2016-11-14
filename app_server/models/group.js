var mongoose = require('mongoose');

// define the schema for the groupchat collection
var groupSchema = new mongoose.Schema({
	groupId: { type: String, required: true },
	groupName: { type: String, required: true },
    members: [Number]
});

// compile the schema into models
mongoose.model('Group', groupSchema);