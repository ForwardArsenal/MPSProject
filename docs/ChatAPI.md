**Chat APIs**
----
  <_this set of APIs is used to send groupchat messages to the chat server and listen for any incoming messages. Make sure the "chat-api.js" file is imported in the source code before using the APIs. And please also note that only the rest of the group members (not including sender) will receive the message forwarded from the chat server._>

> **ChatClient(eventEmitter: EventEmitter, io: socket.io-client, userId: int):**
  instantiate a ChatClient object, the arguments that are passed to this constructor include 
  a Reactive Native event emitter object, the io global exposed by importing the /socket.io-client/socket.io in Reactive Native code, and the userId, which is an integer. Right now, for testing purpose, we only have one group registered, the groupId is 1, the groupName is "stress", and the members are 1, 2, 3, 4. So, make sure the userId specified here is chosen among those four numbers.
  
> **ChatClient#sendMessage(userName: String, groupId: int, groupName: String, content: String):**
 invoke the sendMessage method on the ChatClient object. 
+ **eg.** &nbsp;&nbsp; chatClient.sendMessage("Tom", 1, "stress", "Hello guys!");

> **ChatClient#ready():**
the method returns the event emitter of the chat client.

> **EventEmitter#on('newMsgReceived', callback):**
 listen for the 'newMsgReceived' event, a callback must be provided to retrieve the message once the event is triggered.

> **ChatClient#getMostRecentMsg():**
NOTE: this method should only be invoked within the callback that is regarded as the event handler of the 'newMsgReceived' event. The method returns a Javascript object. The properties of this object is indicated as follows,
* { groupId: int, groupName: String, userId: int, userName: String, content: String, creationTime: String }
+ **eg.** chatClient.ready().addListener('newMsgReceived', function(){
    console.log(chatClient.getMostRecentMsg().content);
 });
