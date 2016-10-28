var ChatClient = require('../app_client/lib/chat-api');
var client2 = new ChatClient(2);
console.log("Start listening for new incoming message!");
client2.ready().on('newMsgReceived', function(){
	var len = client2.msgStack.length;
	console.log(client2.getMostRecentMsg().content+"--created at "+client2.getMostRecentMsg().creationTime);
});