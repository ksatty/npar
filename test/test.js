var npar = require(".."),
    vows = require("vows"),
    assert = require("assert");

vows
    .describe("NPar Tests")
    .addBatch({
        "Context": {
            topic: function() {
                var _self = this;

                npar({"name":"owner"})
                    .add(function(callback){
                        callback("1");
                    })
                    .add(function(callback){
                        callback("2");
                    })
                    .add(function(callback){
                        callback("3");
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
                        callback("1");
                    })
                    .add(function(callback){
                        callback("2");
                    })
                    .add(function(callback){
                        callback("3");
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
    }).run();
