"use strict";

var cp = require('child_process');

module.exports = function (Domain) {
    Domain.prototype.exec = function (params, dest) {
        var d = this;
        var cmd = cp.spawn(params.command, params.args);
        var stdout = dest.concat('stdout');
        var stderr = dest.concat('stderr');
        var end = dest.concat('close');
        
        cmd.stdout.on('data', function (data) {
            d.send(stdout, [], data.toString());
        });
        cmd.stderr.on('data', function (data) {
            d.send(stderr, [], data.toString());
        });

        // cmd.stdout.on('error', function () {
        //     console.log('error ', arguments);
        // });
        cmd.on('error', function (err) {
            console.error('dual-exec error ', err, err.stack);
        });
        cmd.on('close', function (code) {
            d.send(end, [], null, { statusCode: code });
        });
    };
};
