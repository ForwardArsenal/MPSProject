var ChatClient = require('../app_client/lib/chat-api');
var client4 = new ChatClient(4);
client4.eventEmitter.on('newMsgReceived', function(){
	var len = client4.msgStack.length;
	console.log("The returned message retrieved by client"+client4.userId+" is "+client4.getMostRecentMsg().content);
	console.log("The creation time is "+client4.getMostRecentMsg().creationTime);
});