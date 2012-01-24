var should = require('should'),
    delayPool = require('../lib/poolr.js').createPool(5),
    called = 0;

var randomSleep = function(callback) {
    called ++;
    var delay = Math.ceil(Math.random() * 200);
    setTimeout(function(){
        callback(null, 'returning after ' + delay/1000 + ' secs.');
    }, delay);
}

describe('poolr with limit 5', function() {
    it('should call all tasks', function(done) {
        var outstanding = 0;
        for (var i=0; i<10; i++) {
            outstanding++;
            (function(i){
                delayPool._addTask(randomSleep, function(err, res) {
                    if (--outstanding === 0) {
                        called.should.eql(10);
                        done();
                    }
                });
            })(i);
        }
    });
});


