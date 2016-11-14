/*
var moment = require('moment');
//console.log(moment(Date.now()).format("DD MMM YYYY hh:mm a"));
var formattedDate1 = moment(Date.now()).format("DD MMM YYYY hh:mm a");
var formattedDate2 = "05 Nov 2016 10:15 am";
//console.log(formattedDate1);
//console.log(moment(formattedDate1).isBefore(Date.now()));
//console.log(moment(formattedDate1).toDate());
//console.log(formattedDate1<formattedDate2);
var a = "1000&05 Nov 2016 10:15 am";
var b = "1200&05 Nov 2016 11:00 am";
var c = "1003&05 Nov 2016 01:00 pm";
var arr = [a, b, c];

var sortedArr = arr.sort(function(a, b){
	return a.split("&")[0]-b.split("&")[0];
});

var output = [];
sortedArr.forEach(function(item){
    output.push(item.split("&")[1]);
});
console.log(output);
*/

var uuid = require('uuid');
console.log(uuid.v1());