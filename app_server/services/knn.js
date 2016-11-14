var PriorityQueue = require('priorityqueuejs');

var dist = function(v1, v2){
    var sum = 0;
    v1.forEach(function(val, index){
    	sum += Math.pow(val-v2[index], 2);
    });
    return Math.sqrt(sum);
}

var getMaxDist = function(arr){
	var max = 0;
	arr.forEach(function(obj)){
        max = Math.max(max, obj.dist);
	}
	return max;
}

var getResultLabel = function(pq){
    var freqMap = {};
    var max = 0;
    var resLabel;
    var curLabel;
    pq.forEach(function(item){
    	curLabel = item.label;
    	if(curLabel in freqMap){
    		freqMap[curLabel] += 1;
    	}
    	else{
    		freqMap[curLabel] = 1;
    	}
    	if(freqMap[curLabel]>max){
    		max = freqMap[curLabel];
            resLabel = curLabel;
    	}
    });
    return resLabel;
}

function kNN(k){
    this.k = k;
    this.training = [];
}

kNN.prototype.learn = function(vector, label){
	var self = this;
    var obj = { vector: vector, label: label };
    self.training.push(obj);
};

kNN.prototype.classify = function(vector){
	var self = this;
	var arr = [];
	var maxDistance = 0;
	var pq = new PriorityQueue(function(a, b){
		return b.dist-a.dist;
	});
	self.training.forEach(function(item){
        arr.push({ dist: dist(vector, item.vector), label: item.label });
	});
	for(var i=0;i<arr.length;i++){
		pq.enq(arr[i]);
		if(pq.size()>k){
			pq.deq();
		}
	}
    var resultLabel = getResultLabel(pq);
    return resultLabel;
};
