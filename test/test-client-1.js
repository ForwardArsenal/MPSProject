var ChatClient = require('../app_client/lib/chat-api');
//console.log("start to send message");
//client1.sendMessage('Tom', 1, "stress", "Why don't you give it a shot?!");

var readline = require('readline');
// userName = Jean12345
var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNTM2OTcyMC1iOGFhLTExZTYtYmM3My02NWJkMTBjNWI0ZGQiLCJ1c2VyTmFtZSI6IkplYW4xMjM0NSIsInBhc3N3b3JkIjoiOTg3NjUiLCJncm91cElkIjoiZjM4OTk1MTAtYjhhYS0xMWU2LTlkZTktMWQxYTVlYmM0NTg4IiwiaWF0IjoxNDgxMTY4NTQwLCJleHAiOjE0ODEzNDEzNDB9.NgKlfkfW7V99mAU301p1wQUYhZDHTQbBn3bV1etP2ow";
var client1 = new ChatClient(token);
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Send message one: ', function(message){
    client1.sendMessage(message);
    rl.question('Send message two: ', function(message){
        client1.sendMessage(message);
        rl.close();
    });
});
