
var moment = require('moment');
//console.log(moment(Date.now()).format("DD MMM YYYY hh:mm a"));
//var formattedDate1 = moment(Date.now()).format("DD MMM YYYY hh:mm a");
var formattedDate1 = moment(new Date()).format("DD MMM YYYY hh:mm a");
var formattedDate2 = "05 Dec 2016 10:15 am";
//console.log(formattedDate1);
//console.log(moment(formattedDate1).isBefore(Date.now()));
//console.log(moment(formattedDate1).toDate());
//console.log(formattedDate1<formattedDate2);
//console.log(moment(formattedDate1).format("DD MMM YYYY hh:mm a"));
//console.log(formattedDate1);
//console.log(moment(formattedDate1, "DD MMM YYYY hh:mm a").milliseconds());
//console.log(Date.now());
var str = new Date().toISOString();
console.log(new Date(str).getTime());
var a = "1000&05 Nov 2016 10:15 am";
var b = "1200&05 Nov 2016 11:00 am";
var c = "1003&05 Nov 2016 01:00 pm";
var arr = [a, b, c];

/*
var sortedArr = arr.sort(function(a, b){
	return a.split("&")[0]-b.split("&")[0];
});

var output = [];
sortedArr.forEach(function(item){
    output.push(item.split("&")[1]);
});
console.log(output);
*/

//var uuid = require('uuid');
//console.log(uuid.v1());
/*
var tags = { "school#uncertainty": 0, "school#grades": 5, "school#time#grades": 0,"school#self-doubt": 0,    "work#uncertainty#money": 0, "work#uncertainty": 3, "work#time": 0, "relationships#family#conflict": 0,      "relationships#lonely": 4, "relationships#conflict": 0, "relationships#time": 0, "relationships#grief": 0, "home#health": 0, "home#money#safety": 0, "home#election": 2 };
console.log(tags);
console.log(Object.keys(tags).length);
*/
/*
var PriorityQueue = require('priorityqueuejs');
var pq = new PriorityQueue();
pq.enq(2);
pq.enq(5);
pq.enq(1);

console.log(pq.peek());
*/

