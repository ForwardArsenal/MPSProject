var mongoose = require('mongoose');

// define the schema for the groupchat collection
var groupchatMsgSchema = new mongoose.Schema({
	groupId: { type: Number, required: true },
	groupName: { type: String, required: true },
    senderId: { type: Number, required: true },
    senderName: { type: String, required: true },
    msgContent: String,
    timeStamp: { type: Date, default: Date.now}
});

// compile the schema into models
mongoose.model('GroupchatMsg', groupchatMsgSchema, 'GroupchatMsgs');