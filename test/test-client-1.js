var ChatClient = require('../app_client/lib/chat-api');
var client1 = new ChatClient(1, 1);
//console.log("start to send message");
//client1.sendMessage('Tom', 1, "stress", "Why don't you give it a shot?!");

var readline = require('readline');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Send message one: ', function(message){
    client1.sendMessage('Tom', 1, "stress", message);
    rl.question('Send message two: ', function(message){
        client1.sendMessage('Tom', 1, "stress", message);
        rl.close();
    });
});
