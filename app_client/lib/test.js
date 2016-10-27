var eventify = function(arr, callback){
	arr.push = function(e){
		Array.prototype.push.call(arr, e);
		callback(arr);
	};
};

var testArr = [1, 2];
var nArr = [1, 5];
testArr.push(3);

eventify(testArr, function(updatedArr){
	console.log(updatedArr.length);
});

testArr.push(4);
testArr.push(5);
testArr.push(6);
nArr.push(4);
nArr.push(7);



