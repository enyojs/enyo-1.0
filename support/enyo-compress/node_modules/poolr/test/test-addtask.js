var should = require('should'),
    delayPool = require('../lib/poolr.js').createPool(2),
    called = 0,
    running = 0;


var randomSleep = function(payload, callback) {
    called ++;
    running ++;
    running.should.be.below(3);
    var args = Array.prototype.slice.call(arguments);

    var delay = Math.ceil(Math.random() * 500);
    setTimeout(function(){ running--; return callback(null, payload); }, delay);
}

describe('poolr', function() {
    describe('with limit two', function() {
        it('should not run more than two tasks', function(done) {
            var outstanding = 0;
            for (var i=0; i<10; i++) {
                outstanding++;
                (function(i){
                    running.should.be.below(3);
                    return delayPool.addTask(randomSleep, i, function(err, res){
                        running.should.be.below(3);
                        if (--outstanding === 0) {
                            done();
                        }
                    });
                })(i);
            }
        });

        it('should have been called 10 times', function(done) {
            delayPool._addTask(function(cb){return cb(null);},function(dummy) {
                called.should.eql(10);
                done();
            });
        });
    });
});

