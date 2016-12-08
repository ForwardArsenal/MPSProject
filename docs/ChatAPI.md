**Chat APIs**
----
  <_this set of APIs is used to send groupchat messages to the chat server, listen for any incoming messages and fetch a list of history messages. Make sure the socket.io-client library is imported in the source code before using the API and the global "io" is exposed. And please also note that only the rest of the group members (not including sender himself) will receive the message forwarded from the chat server._>

> **client = io.connect("https://agile-savannah-12064.herokuapp.com", { transports: ['websocket'],  'force new connection': true,  query: 'auth_token='+token
});**

> connect to the chat server which is hosted on a Heroku server identified by the specified URL and options object. UPDATE!!! in the options object, a new attribute "query" is specified, and its corresponding token value must be appended.

> **client.on('connect', function(){ / everything starts from here  /});**

> **IMPORTANT!!!** Make sure the following code is always included in the callback function.(which is the event handler of 'connect', and will be triggered when the previous io.connect(url) method succeeds).
  
> **client.emit('joinChatGroup');**

> trigger the "joinChatGroup" event whenever a new user joins the chat group. The socket representing this specific client user will be stored on the chat server. UPDATE!!! No more userId and groupId anymore! The emitter will not receive the response after triggering this event, the idea behind this is that this API is used to notify all the other group members that a new user has just joined the chat group.

> **client.on('joined', { userName: String, groupName: String });** 

> listen for the 'joined' event, and when it is triggered, an object with userName and groupName is returned.
   
> **client.emit('sendMsg', { content: String });**

> Note that "Date" refers to the JavaScript Date object represented in number of milliseconds since epoch time, which can be returned by simply invoking Date.now(). Update!!! Only content is explicitly specified in the parameter.

> **client.on('msgReceived', function(msg){ / any operations concerned with the retrieved message /});**

> listen for the 'msgReceived' event, a callback must be provided to retrieve the message once the event is triggered. The message object has the following schema,
 { groupId: String, groupName: String, userId: String, userName: String, content: String, creationTime: String)
 "userId" refers to the sender Id, and the "userName" refers to the sender name.
 Note that the value type of the "creationTime" attribute is string, it has already been parsed into a user-friendly format.
 Update!!! groupId and userId are now String!

> **client.emit('fetchHistoryMsg')**

> fetch a list of history messages from the chat group indentified by the groupId. Update!!! No need to pass in groupId!
  
> **client.on('historyMsgReceived', function(msgArr){ / any operations concerned with the retrieved list of history messages / })**

> listens for the 'historyMsgReceived' event. 'msgArr' refers to an array of message objects, and the schema of the message object is consistent with the one specified above.