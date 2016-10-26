var mongoose = require('mongoose');

// define the schema for the user collection
var userSchema = new mongoose.Schema({
	userId: { type: Number, required: true },
	userName: { type: String, required: true},
	email: { type: String, required: true },
	password: { type: String, required: true}
});

// compile the schema into models
mongoose.model('User', userSchema, 'Users');