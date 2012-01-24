var should = require('should'),
    delayPool = require('../lib/poolr.js').createPool(2);


var sleep05 = function(callback) {
    setTimeout(function(){return callback(null)}, 500);
}

var throttled = 0;
var drained = 0;
var idled = 0;
var lasted = 0;

delayPool.on('throttle', function() {
    throttled ++;
}).on('drain', function() {
    drained ++;
}).on('last', function() {
    lasted ++;
}).on('idle', function() {
    idled++;
});

describe('poolr', function() {
    describe('of two', function() {
        it('should not emit throttle on first job', function() {
            delayPool.addTask(sleep05);
            throttled.should.eql(0);
        });
        it('should not emit drain after first job', function() {
            drained.should.eql(0);
        });
        it('should not emit throttle on second job', function() {
            delayPool.addTask(sleep05);
            throttled.should.eql(0);
        });
        it('should not emit drain after second job', function() {
            drained.should.eql(0);
        });
        it('should emit throttle on third job', function() {
            delayPool.addTask(sleep05);
            throttled.should.eql(1);
        });
        it('should have been throttled once on forth job', function() {
            delayPool.addTask(sleep05);
            throttled.should.eql(1);
        });
        it('should have emitted "throttle" excactly once', function(done) {
            setTimeout(function(){
                throttled.should.eql(1);
                done();
            }, 1000);
        });
        it('should have emitted "drain" excactly once', function() {
            drained.should.eql(1);
        });
        it('should have emitted "last" at least once', function() {
            lasted.should.be.above(0);
        });
        it('should have emitted "idle" excactly once', function() {
            idled.should.eql(1);
        });
    });
});


