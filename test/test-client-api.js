var ChatClient = require('../app_client/lib/chat-api');

var client1 = new ChatClient(1);
var client2 = new ChatClient(2);
var client3 = new ChatClient(3);
var client4 = new ChatClient(4);

client1.sendMessage('Tom', 1, "stress", "Hello guys!");
client2.eventEmitter.on('newMsgReceived', function(){
	var len = client2.msgStack.length;
	console.log("The returned message retrieved by client"+client2.userId+" is "+client2.msgStack[len-1].content);
});
client3.eventEmitter.on('newMsgReceived', function(){
	var len = client3.msgStack.length;
	console.log("The returned message retrieved by client"+client3.userId+" is "+client3.msgStack[len-1].content);
});
client4.eventEmitter.on('newMsgReceived', function(){
	var len = client4.msgStack.length;
	console.log("The returned message retrieved by client"+client4.userId+" is "+client4.msgStack[len-1].content);
});