'use strict';
var Alexa = require("alexa-sdk");

//var APP_ID = "amzn1.ask.skill.b229e3a0-3ac1-4d0d-9c3b-cbf8131bde8d";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
  'LaunchRequest': function () {
        this.emit(':tell', 'Hello World!');
  },
  'GetTubeIntent': function () {
    var test = this.event.request.intent.slots.Test.value.toLowerCase();
    console.log(test);
    if (test == "complete blood count") {
      console.log('found a CBC!');
      this.emit(':tell', 'For the Complete Blood Count test, use the lavender tube.');
    }
    else if (test == "basic metabolic panel") {
      console.log('found a BMP!');
      this.emit(':tell', 'For the Basic Metabolic Panel test, use the gold tube.');
    }
    else {
      console.log('found nothing');
      this.emit(':tell', 'Hello World!');
    }
  }
};
