var ChatClient = require('../app_client/lib/chat-api');
var client1 = new ChatClient(1);
client1.sendMessage('Tom', 1, "stress", "Why don't you give it a shot?!");