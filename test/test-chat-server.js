var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:5000';

var options = {
	transports: ['websocket'],
	'force new connection': true
};

var chatUser1 = { 'userId': 1, 'userName': 'Tom' };
var chatUser2 = { 'userId': 2, 'userName': 'Jack' };
var chatUser3 = { 'userId': 3, 'userName': 'Mary' };
var chatUser4 = { 'userId': 4, 'userName': 'Lily' };

describe("Chat Server", function(){
	/*  Test-- User sends a message in the group, and all the other group members 
	should receive that message  */
	it('should be able to broadcast messages', function(done){
        var client1, client2, client3, client4;
        var message = { userId: 1, userName: chatUser1.userName, groupId: 1, groupName: 'stress', 
        msgContent: 'Hello World!' };
        var messages = 0;
        
        var checkMessage = function(client){
        	client.on('message', function(msg){
        		message.msgContent.should.equal(msg.content);
        		message.userId.should.equal(msg.senderId);
        		message.userName.should.equal(msg.senderName);
        		message.groupId.should.equal(msg.groupId);
        		client.disconnect();
        		messages++;
        		if(messages == 3){
        			done();
        		}
        	});
        	client.on('msgReply', function(obj){
                console.log("The error code is "+obj.ret);
        	});
        };

        client1 = io.connect(socketURL, options);
        //checkMessage(client1);

        client1.on('connect', function(data){
        	client1.emit('registration', chatUser1);
        	client2 = io.connect(socketURL, options);
        	checkMessage(client2);

        	client2.on('connect', function(data){
        		client2.emit('registration', chatUser2);
        		client3 = io.connect(socketURL, options);
        		checkMessage(client3);

        		client3.on('connect', function(data){
        			client3.emit('registration', chatUser3);
                    client4 = io.connect(socketURL, options);
                    checkMessage(client4);

                    client4.on('connect', function(data){
                    	client4.emit('registration', chatUser4);
                    	client1.emit('sendMsg', message);
                    });
        		});
        	});
        });
	});
})