'use strict';
var Alexa = require("alexa-sdk");

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
  'LaunchRequest': function () {
        this.emit(':tell', 'Welcome to the Blood Draw skill!');
  },
  'GetTubeIntent': function () {
    var test = this.event.request.intent.slots.Test.value.toLowerCase();
    if (test == "complete blood count") {
      this.emit(':tell', 'For the Complete Blood Count test, use the lavender tube.');
    }
    else if (test == "basic metabolic panel") {
      this.emit(':tell', 'For the Basic Metabolic Panel test, use the gold tube.');
    }
    else {
      this.emit(':tell', 'Sorry, I don\'t have information for that test. Please ask about a different one.');
    }
  }
};
