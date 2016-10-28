var mongoose = require('mongoose');

// define the schema for the groupchat collection
var groupchatMsgSchema = new mongoose.Schema({
	groupId: { type: Number, required: true },
	groupName: { type: String, required: true },
    senderId: { type: Number, required: true },
    senderName: { type: String, required: true },
    receiverId: { type: Number, required: true },
    content: String,
    //timeStamp: { type: Date, default: Date.now }
    creationTime: { type: String, required: true }
});

// compile the schema into models
mongoose.model('GroupchatMsg', groupchatMsgSchema, 'GroupchatMsgs');