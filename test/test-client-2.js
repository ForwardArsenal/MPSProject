var ChatClient = require('../app_client/lib/chat-api');
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI0YTJkOTA3MC1iOGFhLTExZTYtYmM3My02NWJkMTBjNWI0ZGQiLCJ1c2VyTmFtZSI6Ikxlb0phY2tzb24iLCJwYXNzd29yZCI6IjEyMzQ1IiwiZ3JvdXBJZCI6ImYzODk5NTEwLWI4YWEtMTFlNi05ZGU5LTFkMWE1ZWJjNDU4OCIsImlhdCI6MTQ4MTE2ODU2NCwiZXhwIjoxNDgxMzQxMzY0fQ.dmK3qWitmAb1g_WHwgFlPzVh2cRpr0A3vyV8VW0i49I";
// userName = LeoJackson
var client2 = new ChatClient(token);
console.log("Start listening for new incoming message!");
client2.ready().on('newMsgReceived', function(){
	var len = client2.msgStack.length;
	console.log(client2.getMostRecentMsg().content+"--created at "+client2.getMostRecentMsg().creationTime+" by "+client2.getMostRecentMsg().userName);
});
client2.fetchHistoryMsg();
/*  addListener() is used in the React Native context
client2.addListener('newMsgReceived', function(){
	var len = client2.msgStack.length;
	console.log(client2.getMostRecentMsg().content+"--created at "+client2.getMostRecentMsg().creationTime);
});
*/