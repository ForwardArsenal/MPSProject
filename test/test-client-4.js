var ChatClient = require('../app_client/lib/chat-api');
// userName = Tim123
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmZWZhODNmMC1iOGI5LTExZTYtYmJiNS1kNzc2ZmYyNjZjODIiLCJ1c2VyTmFtZSI6IlRpbTEyMyIsInBhc3N3b3JkIjoiMTIzNCIsImdyb3VwSWQiOiJmMzg5OTUxMC1iOGFhLTExZTYtOWRlOS0xZDFhNWViYzQ1ODgiLCJpYXQiOjE0ODExNjg2NDcsImV4cCI6MTQ4MTM0MTQ0N30.5nEfW4MydreGAqRflQkgzCILxneKww-q1PCUMcAFFww";
var client4 = new ChatClient(token);
console.log("Start listening for new incoming message!");
client4.ready().on('newMsgReceived', function(){
	var len = client4.msgStack.length;
	console.log(client4.getMostRecentMsg().content+"--created at "+client4.getMostRecentMsg().creationTime+" by "+client4.getMostRecentMsg().userName);
});