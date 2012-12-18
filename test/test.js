var npar = require(".."),
    vows = require("vows"),
    assert = require("assert");

var v = vows
    .describe("NPar Tests")
    .addBatch({
        "No Processes": {
            topic: function() {
                var _self = this;

                npar({"name":"owner"}).exec(function(err, data){
                        _self.callback(err, this);
                    });
            },
            "ok": function(err, data) {
                assert.isNotNull(err);
            }
        },
        "Context": {
            topic: function() {
                var _self = this;

                npar({"name":"owner"})
                    .add(function(callback){
                        callback(null, "1");
                    })
                    .add(function(callback){
                        callback(null, "2");
                    })
                    .add(function(callback){
                        callback(null, "3");
                    })
                    .exec(function(err, data){
                        _self.callback(err, this);
                    });
            },
            "ok": function(err, data) {
                assert.isNull(err);
                assert.isNotNull(data.npar);
            }
        },
        "No Context": {
            topic: function() {
                var _self = this;

                npar()
                    .add(function(callback){
                        callback(null, "1");
                    })
                    .add(function(callback){
                        callback(null, "2");
                    })
                    .add(function(callback){
                        callback(null, "3");
                    })
                    .exec(function(err, data){
                        _self.callback(err, this);
                    });
            },
            "ok": function(err, data) {
                assert.isNull(err);
                assert.isUndefined(data.npar);
            }
        }
    });

try {
    v.export(module);
} catch (e){
    v.run();
}