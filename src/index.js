'use strict';
var Alexa = require("alexa-sdk");
var fs = require("fs");
var data = JSON.parse(fs.readFileSync("data.json"));

//var APP_ID = "amzn1.ask.skill.b229e3a0-3ac1-4d0d-9c3b-cbf8131bde8d";

/*
  TESTING PROCEDURE:
    - make sure you're in the src directory
    - node_modules/.bin/mocha
*/

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function() {
        this.emit(':ask', 'Welcome to the Blood Draw skill! Which test would you like to know about?', 'Please specify a test.');
    },
    'GetTubeIntent': function() {
        var test_data = this.event.request.intent.slots.Test.value.toLowerCase();
        console.log('test_data -> ' + test_data);
        var tests = get_tests(test_data);
        console.log(tests);
        var s = "";
        for (var i=0; i<tests.length; i++) {
          /*if (!data.hasOwnProperty(test)) {
              console.log('data doesn\'t have it');
              test = test_map[test];
              console.log('test is now -> ' + test);
          }*/
          //if (tests[i] != null) {
              // var s = get_prefix(test) + ', use the ' + data[test]["tube"] + ' tube.';
              var test = tests[i];
              var quantity_suffix = data[test]["amount"] == 1 ? ' milliliter' : ' milliliters';
              var info = data[test]["info"].length > 0 ? ' Remember, ' + data[test]["info"] + '.' : "";
              s += ' ' + get_prefix(test) + ', use the ' + data[test]["tube"] + ' tube. It needs a quantity of ' + data[test]["amount"] + quantity_suffix + '.' + info;
              console.log(s);
          /*} else {
              var s = 'Sorry, I don\'t have information for that test. Please ask about a different one.';
              console.log(s);
              this.emit(':tell', s);
          }*/
        }
        this.emit(':tell', s);
    }
};

var get_prefix = function(test) {
    if (test.includes('panel')) {
        return "For the " + test;
    }
    return "For the " + test + " test";
}

var get_tests = function(test) {
  var words = get_words(test);
  var tests = [];
  var current = "";
  for (var i=0; i<words.length; i++) {
    if (current.length > 0) {
      current += " " + words[i];
    }
    else {
      current = words[i];
    }
    if (data.hasOwnProperty(current)) {
      tests.push(current);
      current = "";
    }
    else if (test_map.hasOwnProperty(current)) {
      tests.push(test_map[current]);
      current = "";
    }
  }
  return tests;
}

var get_words = function(test) {
  var words = [];
  var current = "";
  for (var i=0; i<test.length; i++) {
    if (test.charCodeAt(i) != 32) {
      current += test[i]
    }
    else {
      words.push(current);
      current = "";
    }
  }
  words.push(current);
  return words;
};

var test_map = {
    "cbc": "complete blood count",
    "bmp": "basic metabolic panel",
    "lipid": "lipid panel",
    "lipids": "lipid panel",
    "hepatic function": "hepatic function panel",
    "liver function panel": "hepatic function panel",
    "liver function": "hepatic function panel",
    "liver": "hepatic function panel",
    "vitamin b12": "vitamin b12 level",
    "b12": "vitamin b12 level",
    "b12 level": "vitamin b12 level",
    "alcohol": "alcohol panel"
};
