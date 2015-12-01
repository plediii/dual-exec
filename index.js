"use strict";

var cp = require('child_process');

module.exports = function (Domain) {
    Domain.prototype.exec = function (point) {
        var d = this;
        d.mount(point, function (body, ctxt) {
            var params = body || {};
            params.cwd = params.cwd || '/tmp';
            return cp.exec(params, function (err, stdout, stderr) {
                var result = {
                    stdout: stdout
                    , stderr: stderr
                };
                if (err) {
                    result.err = err.message;
                    console.error('dual-exec error: ', err, err.stack);
                    ctxt.return(result, { statusCode: 500 });
                } else {
                    ctxt.return(result);
                }
            });
        });
    };
};
