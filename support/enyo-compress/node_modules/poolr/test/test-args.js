var should = require('should'),
    poolr = require('../lib/poolr.js'),
    called = 0,
    running = 0;


var checkArg = function(payload, callback) {
    payload.should.eql(called++);
    running ++;
    process.nextTick(function(){return callback(null, payload)});
}

describe('poolr', function() {
    var testPool = poolr.createPool(5);
    describe('taskArguments', function() {
        it('should be dispatched', function(done) {
            var outstanding = 0;

            for (var i=0; i<10; i++) {
                outstanding++;
                (function(i){
                    testPool._addTask(
                        function(callback) { return checkArg(i, callback); },
                        function(err, res) {
                            res.should.eql(i);
                            if (--outstanding === 0) {
                                done();
                            }
                        }
                    );
                })(i);
            }
        });
    });
});


