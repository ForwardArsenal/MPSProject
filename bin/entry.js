#!/usr/bin/env node
// the entry point of the project
var argv = require('optimist').argv;
var server;
switch(argv.s){
	// start the web server
	case 'webserver':
	    server = require('../app_server/webserver');
	    break;
	case 'sioserver':
	    server = require('../app_server/chatserver');
	    break;
	default:
	    console.error('unknown server type' + argv.s);
	    break;
}

// start the server specified by the command line argument
server.start();
