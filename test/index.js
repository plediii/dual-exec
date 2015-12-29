"use strict";

var Promise = require('bluebird');
var test = require('tape');
var pathlib = require('path');
var fs = Promise.promisifyAll(require('fs'));

var dualapi = require('dualapi').use(require('..'));


test('dual-tail', function (t) {
    var testContext = function () {
        var d = dualapi();
        return Promise.resolve([d]);
    };

    t.test('replies to destination host/stdout', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            d.mount(['receiver', 'stdout'], function (body, ctxt) {
                s.pass('Received data');
            });
            d.exec({
                command: 'echo'
                , args: ['doctor']
            }, ['receiver']);
        });
    });

    t.test('replies to destination host/stdout with output', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            var buffer = '';
            d.mount(['receiver', 'stdout'], function (body, ctxt) {
                buffer += body;
                if (buffer === ' doctor\n') {
                    s.pass('Received output');
                }
            });
            d.exec({
                command: 'echo'
                , args: [' doctor']
            }, ['receiver']);
        });
    });

    t.test('replies to destination host/end on completion', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            var buffer = '';
            d.mount(['receiver', 'close'], function (body, ctxt) {
                s.pass('End');
            });
            d.exec({
                command: 'echo'
                , args: [' doctor']
            }, ['receiver']);
        });
    });

    t.test('replies to destination host/end with succcess status code on success', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            var buffer = '';
            d.mount(['receiver', 'close'], function (body, ctxt) {
                s.equal(ctxt.options.statusCode, 0, 'received success status code');
            });
            d.exec({
                command: 'echo'
                , args: [' doctor']
            }, ['receiver']);
        });
    });

    t.test('replies to stderr output with error text', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            var stderr = false;
            d.mount(['receiver', 'stderr'], function (body, ctxt) {
                stderr = true;
            });
            d.mount(['receiver', 'close'], function () {
                s.ok(stderr, 'Recevied stderr before close');
            });
            d.exec({
                command: 'touch'
                , args: ['/notexist']
            }, ['receiver']);
        });
    });

    t.test('replies to end with error status code on failure', function (s) {
        s.plan(1);
        testContext()
        .spread(function (d) {
            var buffer = '';
            d.mount(['receiver', 'close'], function (body, ctxt) {
                s.notEqual(ctxt.options.statusCode, 0, 'Received failure status code');
            });
            d.exec({
                command: 'touch'
                , args: ['/notexist']
            }, ['receiver']);
        });
    });
});
