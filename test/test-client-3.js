var ChatClient = require('../app_client/lib/chat-api');
var client3 = new ChatClient(3);
client3.eventEmitter.on('newMsgReceived', function(){
	var len = client3.msgStack.length;
	console.log("The returned message retrieved by client"+client3.userId+" is "+client3.getMostRecentMsg().content);
	console.log("The creation time is "+client3.getMostRecentMsg().creationTime);
});