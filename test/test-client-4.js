var ChatClient = require('../app_client/lib/chat-api');
var client4 = new ChatClient(4);
console.log("Start listening for new incoming message!");
client4.ready().on('newMsgReceived', function(){
	var len = client4.msgStack.length;
	console.log(client4.getMostRecentMsg().content+"--created at "+client4.getMostRecentMsg().creationTime);
});