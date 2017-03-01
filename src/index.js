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
        this.emit(':tell', 'Welcome to the Blood Draw skill!');
    },
    'GetTubeIntent': function() {
        var test = this.event.request.intent.slots.Test.value.toLowerCase();
        console.log('test -> ' + test);
        if (!data.hasOwnProperty(test)) {
            console.log('data doesn\'t have it');
            test = test_map[test];
            console.log('test is now -> ' + test);
        }
        if (test != null) {
            // var s = get_prefix(test) + ', use the ' + data[test]["tube"] + ' tube.';
            var suffix = data[test]["amount"] == 1 ? ' milliliter' : ' milliliters';
            var s = get_prefix(test) + ', use the ' + data[test]["tube"] + ' tube. It needs a quantity of ' + data[test]["amount"] + suffix;
            console.log(s);
            this.emit(':tell', s);
        } else {
            var s = 'Sorry, I don\'t have information for that test. Please ask about a different one.';
            console.log(s);
            this.emit(':tell', s);
        }
        /*if (test == "complete blood count") {
          //this.emit(':tell', 'For the Complete Blood Count test, use the lavender tube.');
          this.emit(':tell', 'For the Complete Blood Count test, use the ' + data["complete blood count"]["tube"] + ' tube.');
        }
        else if (test == "basic metabolic panel") {
          //this.emit(':tell', 'For the Basic Metabolic Panel test, use the gold tube.');
          this.emit(':tell', 'For the Basic Metabolic Panel, use the ' + data["basic metabolic panel"]["tube"] + ' tube.');
        }
        else {
          this.emit(':tell', 'Sorry, I don\'t have information for that test. Please ask about a different one.');
        }*/
    }
};

var get_prefix = function(test) {
    if (test.includes('panel')) {
        return "For the " + test;
    }
    return "For the " + test + " test";
}

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
