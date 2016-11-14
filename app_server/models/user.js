var mongoose = require('mongoose');

// define the schema for the user collection
var userSchema = new mongoose.Schema({
	userId: { type: String, required: true },
	userName: { type: String, required: true },
	password: { type: String, required: true },
	groupId: { type: String, required: false },
	vector: { type: [Number], required: false } 
});

// compile the schema into models
mongoose.model('User', userSchema, 'Users');