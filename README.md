# NPar v0.0.3
-----------

## Usage:

```
var npar = require("npar");

npar()
    .add(function(callback){
        callback("result1")
    })
    .add(function(callback){
        callback("result2")
    })
    .add(function(callback){
        callback("result3")
    })
    .exec(function(err, result){
        if (!err) {
            for (var r in result) {
                console.log(r + ": " + result[r]);
            }
        }
    });
```