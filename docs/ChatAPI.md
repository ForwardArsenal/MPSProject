**Chat APIs**
----
  <_this set of APIs is used to send groupchat messages to the chat server and listen for any incoming messages. Make sure the "chat-api.js" file is imported in the source code before using the APIs_>

> **ChatClient(userId: int):**
  instantiate a ChatClient object, the only argument that is passed to this constructor is the userId, which is an integer. 
+ **eg.** &nbsp;&nbsp;  var ChatClient = require('./app-client/lib/chat-api'); /* note that this is a NodeJs syntax for importing external javascript modules.*/ &nbsp;&nbsp;&nbsp;
var chatClient = new ChatClient(1);

  
>  **ChatClient#sendMessage(userName: String, groupId: int, groupName: String, content: String):**
 invoke the sendMessage method on the ChatClient object. 
+ **eg.** &nbsp;&nbsp; chatClient.sendMessage("Tom", 1, "stress", "Hello guys!");

> **ChatClient#ready():**
the method returns the event emitter of the chat client.

> **EventEmitter#on('newMsgReceived', callback):**
 listen for the 'newMsgReceived' event, a callback must be provided to retrieve the message once the event is triggered.

> **ChatClient#getMostRecentMsg():**
NOTE: this method should only be invoked within the callback that is regarded as the event handler of the 'newMsgReceived' event. The method returns a Javascript object. The properties of this object is indicated as follows,
* { groupId: int, groupName: String, userId: int, userName: String, content: String, creationTime: String }
+ **eg.** chatClient.ready().on('newMsgReceived', function(){
    console.log(chatClient.getMostRecentMsg().content);
 })
