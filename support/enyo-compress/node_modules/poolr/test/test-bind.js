var should = require('should'),
    poolr = require('../lib/poolr.js').createPool;


var someClass = function(someval) {
    this.state = someval;
}

someClass.prototype.someFunc = function (someArg, callback) {
    return callback(this.state, someArg);
}

describe('poolr', function() {
    var myPool = poolr(1);

    describe('method context', function() {
        var obj = new someClass('foo');

        it('should be preserved when using bind()', function(done) {
            myPool.addTask(obj.someFunc.bind(obj), 'bar', function(err, res) {
                err.should.eql('foo');
                res.should.eql('bar');
                done();
            });
        });
    });
});

