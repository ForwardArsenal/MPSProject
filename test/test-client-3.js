var ChatClient = require('../app_client/lib/chat-api');
// userName = Jason123
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmODcyYTQ4MC1iOGFiLTExZTYtYTE5OS02M2IyM2UyYzIwNDciLCJ1c2VyTmFtZSI6Ikphc29uMTIzIiwicGFzc3dvcmQiOiIxMjM0NSIsImdyb3VwSWQiOiJmMzg5OTUxMC1iOGFhLTExZTYtOWRlOS0xZDFhNWViYzQ1ODgiLCJpYXQiOjE0ODExNjg1ODksImV4cCI6MTQ4MTM0MTM4OX0.g6ui_lE5Yqh7MyGbu9vU_-TsVuS0tcoTcsN02-eriyY";
var client3 = new ChatClient(token);
console.log("Start listening for new incoming message!");
client3.ready().on('newMsgReceived', function(){
	var len = client3.msgStack.length;
	console.log(client3.getMostRecentMsg().content+"--created at "+client3.getMostRecentMsg().creationTime+" by "+client3.getMostRecentMsg().userName);
});