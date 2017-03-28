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
          var test = tests[i];
          /*if (!data.hasOwnProperty(test)) {
              console.log('data doesn\'t have it');
              test = test_map[test];
              console.log('test is now -> ' + test);
          }*/
          //if (tests[i] != null) {
              // var s = get_prefix(test) + ', use the ' + data[test]["tube"] + ' tube.';
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
  console.log(words);
  words = strip_ands(words);
  console.log('after strip ands -> ' + words);
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
};

var strip_ands = function(words) {
  var new_words = [];
  for (var i=0; i<words.length; i++) {
    if (words[i] != 'and') {
      new_words.push(words[i]);
    }
  }
  return new_words;
};

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

var tubes = {
  'royal blue': {
      vol: 7,
      contents: 'no additive, special glass and stopper material',
      uses: 'most drug levels, toxicology screens, and trace elements',
      comments: ''
  },
  'red': {
    vol: 7,
    contents: 'no additive',
    uses: 'cryoglobulins and C.H. fifty',
    comments: ''
  },
  'light blue': {
    vol: 4.5,
    contents: '3.2% sodium citrate',
    uses: 'P.T., P.T.T, T.C.T, C.M.V buffy coat, factor activity',
    comments: 'tube must be filled 100%, no exceptions'
  },
  'gold': {
    vol: 6,
    contents: 'separating gel and clot activator',
    uses: 'most chemistry, endocrine and serology tests, including Hepatitis and HIV',
    comments: ''
  },
  'light blue (yellow label)': {
    vol: 2,
    contents: 'thrombin',
    uses: 'for F.D.P. test only',
    comments: 'obtain tube from core lab coag, allow to clot'
  },
  'green': {
    vol: 5,
    contents: 'sodium heparin',
    uses: 'ammonia, lactate, H.L.A. typing',
    comments: ''
  },
  'tan': {
    vol: 5,
    contents: 'K two E.D.T.A.',
    uses: 'lead levels',
    comments: ''
  },
  'yellow': {
    vol: 8.5,
    contents: 'trisodium citrate, citric acid, and dextrose',
    uses: 'D.N.A. studies, H.I.V. cultures',
    comments: ''
  },
  'pink': {
    vol: 6,
    contents: 'K two E.D.T.A.',
    uses: 'blood type and screen, compatibility study, coombs, H.I.V. viral load',
    comments: ''
  },
  'pearl': {
    vol: 4,
    contents: 'separating gel and K two E.D.T.A.',
    uses: 'adenovirus P.C.R., toxoplasma P.C.R., H.H.V. six P.C.R.',
    comments: ''
  },
  'lavender': {
    vol: 3,
    contents: 'K two E.D.T.A.',
    uses: 'C.B.C./Diff/Retic/Sed rate, F.K. 506, cyclosporin, platelet ab, coombs, flow cytometry',
    comments: ''
  }
};
