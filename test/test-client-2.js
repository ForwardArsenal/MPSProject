var ChatClient = require('../app_client/lib/chat-api');
var client2 = new ChatClient(2);
console.log("Start listening for new incoming message!");
client2.eventEmitter.on('newMsgReceived', function(){
	var len = client2.msgStack.length;
	console.log("The returned message retrieved by client"+client2.userId+" is "+client2.getMostRecentMsg().content);
	console.log("The creation time is "+client2.getMostRecentMsg().creationTime);
});