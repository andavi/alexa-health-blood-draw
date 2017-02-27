var ast = require("alexa-skill-tester");
var path = require("path");
var module_under_test = require("../index");

describe("Event tests", function(done) {
    ast(module_under_test.handler, path.resolve(__dirname, "./events"), done);
});
