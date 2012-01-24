var should = require('should'),
    poolr = require('../lib/poolr.js').createPool;


var someClass = function(someval) {
    this.state = someval;
}

someClass.prototype.someFunc = function (someArg, callback) {
    return callback(this.state, someArg);
}

describe('poolr default object', function() {
    var obj = new someClass('foo');
    var myPool = poolr(1, obj);
    it('should preserve method context', function(done) {
        myPool.addTask(obj.someFunc, 'bar', function(err, res) {
            err.should.eql('foo');
            res.should.eql('bar');
            done();
        });
    });
});


