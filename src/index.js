'use strict';
var Alexa = require("alexa-sdk");

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
  'GetTubeIntent': function () {
    var test = this.event.request.intent.slots.Test;
    if (test.value == "CBC" || test.value == "Complete Blood Count") {
      this.emit(':tell', 'For the Complete Blood Count test, use the lavender tube.');
    }
    else if (test.value == "BMP" || test.value == "Basic Metabolic Panel") {
      this.emit(':tell', 'For the Basic Metabolic Panel test, use the gold tube.');
    }
  }
};
