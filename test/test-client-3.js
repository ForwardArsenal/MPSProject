var ChatClient = require('../app_client/lib/chat-api');
var client3 = new ChatClient(3, 1);
console.log("Start listening for new incoming message!");
client3.ready().on('newMsgReceived', function(){
	var len = client3.msgStack.length;
	console.log(client3.getMostRecentMsg().content+"--created at "+client3.getMostRecentMsg().creationTime+" by "+client3.getMostRecentMsg().userName);
});