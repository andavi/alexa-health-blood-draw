'use strict';
var Alexa = require("alexa-sdk");
var fs = require("fs");
var ordinal = require('ordinal').english;

//var file_name = 'old_data.json';
var file_name = 'data.json';
var data = JSON.parse(fs.readFileSync(file_name));
var test_map = JSON.parse(fs.readFileSync('test_map.json'));
//var APP_ID = "amzn1.ask.skill.b229e3a0-3ac1-4d0d-9c3b-cbf8131bde8d";

/*
  TESTING PROCEDURE:
    - make sure you're in the src directory
    - node_modules/.bin/mocha
*/

var test_mode = false;

exports.handler = function(event, context, callback) {
    //event.session['attributes']['flag'] = 'true';
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function() {
        var launch_response = 'Welcome to the Blood Draw skill! If you would like to know about a single test, say 1. If you would like to know about multiple tests, say 2.';
        var launch_reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
        this.emit(':ask', launch_response, launch_reprompt);
    },
    'AMAZON.YesIntent': function() {
        console.log('caught a yes');
        console.log('attributes -> ' + JSON.stringify(this.attributes));
        this.attributes = {};
        console.log('attributes after -> ' + JSON.stringify(this.attributes));
        var response = 'Okay. For a single test, say 1. For multiple tests, say 2.';
        var reprompt = 'Please specify either 1 for a single test, or 2 for multiple tests';
        this.emit(':ask', response, reprompt);
    },
    'AMAZON.NoIntent': function() {
        console.log('caught a no');
        this.emit(':tell', 'Goodbye');
    },
    'AMAZON.CancelIntent': function() {
        console.log('caught a cancel');
        this.emit(':tell', 'Goodbye');
    },
    'AMAZON.StopIntent': function() {
        console.log('caught a stop');
        this.emit(':tell', 'Goodbye');
    },
    'ProcessNumberIntent': function() {
      try {
        var answer = this.event.request.intent.slots.Number.value.toLowerCase();
        console.log('in ProcessNumberIntent');
        console.log('answer -> ' + answer);
        var response = process_number(answer, this.attributes);
        if (response.length != 2) {
          var s = 'response length not 2';
          console.log(s);
          throw s;
        }
        else {
          this.emit(':ask', response[0], response[1]);
        }
      }
      catch (e) {
        console.log('caught error in ProcessNumberIntent -> ' + e);
        var response = 'Sorry, something went wrong. To start over, please say either 1 for a single test, or 2 for multiple tests.';
        var reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
        this.emit(':ask', response, reprompt);
      }
    },
    'GetTubeIntent': function() {
      try {
        console.log('in GetTubeIntent');
        console.log('current attributes -> ' + this.attributes);
        var test_data = this.event.request.intent.slots.Test.value.toLowerCase();
        console.log('test_data -> ' + test_data);
        get_tube(test_data, this.attributes, this);
      }
      catch (e) {
        console.log('caught error in GetTubeIntent -> ' + e);
        var response = 'Sorry, something went wrong. To start over, please say either 1 for a single test, or 2 for multiple tests.';
        var reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
        this.emit(':ask', response, reprompt);
      }
    }
};

var process_number = function(answer, attributes) {
  var response = '';
  var reprompt = '';
  if (attributes.hasOwnProperty('mode') && attributes.mode == 'multiple_tests') {
    // test if you can get a non number here
    if (answer == '?') {
      console.log('found a question mark');
      response = 'How many tests would you like to know about? Please say a number between 1 and 8.';
      reprompt = 'Please specify how many tests you would like to know about.';
    }
    else {
      answer = parseInt(answer);
      if (answer >= 1 && answer <= 8) {
        console.log('answer is between 1 and 8');
        attributes['number_of_tests'] = answer;
        response = 'What\'s the first test?';
        reprompt = 'Please specify the first test.';
      }
      else {
        response = 'How many tests would you like to know about? Please say a number between 1 and 8.';
        reprompt = 'Please specify how many tests you would like to know about.';
      }
    }
  }
  else {
    if (answer == 1) {
      attributes['mode'] = 'single_test';
      response = 'What test would you like to know about?';
      reprompt = 'Please specify which test you would like to know about.';
    }
    else if (answer == 2) {
      attributes['mode'] = 'multiple_tests';
      response = 'How many tests would you like to know about?';
      reprompt = 'Please specify how many tests you would like to know about.';
    }
    else {
      console.log('got answer that wasn\'t 1 or 2 -> ' + answer);
      response = 'Sorry, I didn\'t quite get that. Please say either 1 for a single test, or 2 for multiple tests.';
      reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
    }
  }
  return [response, reprompt];
};

var get_tube = function(test_data, attributes, emitter) {
  var current_test = get_tests(test_data);
  console.log(current_test);
  if (current_test.length < 1) {
    var s = 'Sorry, we couldn\'t find ' + test_data + ' in our records.';
    emitter.emit(':tellWithCard', s, 'Blood Draw', s);
  }
  else {
    if (attributes.hasOwnProperty('mode')) {
      if (attributes.mode == 'single_test') {
        console.log('single test mode');
        var test = current_test[0];
        handle_single_test_mode(test, emitter);
      }
      else if (attributes.mode == 'multiple_tests') {
        console.log('multiple test mode');
        var test = current_test[0];
        handle_multiple_tests_mode(test, attributes, emitter);
      }
    }
    else {
      console.log('no mode property');
    }
  }
};

var handle_single_test_mode = function(test, emitter) {
  console.log('in handle_single_test_mode');
  console.log('test -> ' + test);
  var specimen_string = data[camelize(test)]['data']['Specimen'];
  var amount_needed_for_test = get_amount_needed(specimen_string);
  var tube_color = get_tube_color(specimen_string);
  var tube_vol = tubes[tube_color]['vol'];
  var num_of_tubes_needed = get_num_of_tubes_needed(amount_needed_for_test, tube_vol);
  var s = get_prefix([test]) + get_tubes_output(tube_color, num_of_tubes_needed);
  console.log('s -> ' + s);
  emitter.emit(':askWithCard', s + ' Anything else?', 'Anything else?', 'Blood Draw', s + '\nLink: ' + data[camelize(test)]['link']);
};

var handle_multiple_tests_mode = function(test, attributes, emitter) {
  console.log('in handle_multiple_tests_mode');
  console.log('attributes -> ' + attributes);
  if (attributes.hasOwnProperty('tests')) {
    console.log('tests property exists');
    if (attributes.tests.indexOf(test) == -1) {
      attributes.tests.push(test);
    }
    else {
      console.log('that test is already in there');
      var s = test + ' has already been added to the list. Please specify another test.';
      emitter.emit(':ask', s, 'Please specify another test.');
    }
    console.log(attributes.tests);
  }
  else {
    attributes['tests'] = [test];
  }
  console.log('attributes now -> ' + attributes);
  if (attributes.tests.length == attributes.number_of_tests) {
    console.log('got em all!');
    var s = get_multiple_tests_response(attributes.tests);
    emitter.emit(':ask', s + ' Anything else?', 'Anything else?');
  }
  else {
    var response = 'What\'s the ' + ordinal(attributes.tests.length + 1) + ' test?';
    console.log(response);
    var reprompt = 'Please specify what the ' + ordinal(attributes.tests.length + 1) + ' test is.';
    emitter.emit(':ask', response, reprompt);
  }
};

// make each word in the test name uppercase, for interoperability w/ the data.json file
var camelize = function(test) {
  //console.log('in camelize, test -> ' + test);
  var words = test.split(' ');
  for (var i=0; i<words.length; i++) {
    words[i] = words[i].slice(0, 1).toUpperCase() + words[i].slice(1);
  }
  var camel_test = words.join(' ');
  //console.log('camel_test -> ' + camel_test);
  return camel_test;
};
exports.camelize = camelize;

// parses the test's specimen field from the data.json file in order to find the amount needed
var get_amount_needed = function(specimen) {
  //console.log('in get_amount_needed');
  var words = specimen.split(' ');
  for (var i=0; i<words.length; i++) {
    //console.log(i, words[i]);
    if (words[i].toLowerCase() == 'ml') {
      //console.log('found an ml');
      if (i != 0) {
        return parseInt(words[i-1]);
      }
    }
  }
  throw 'couldn\'t find amount from specimen string -> ' + specimen;
};
exports.get_amount_needed = get_amount_needed;

// parses the test's specimen field from the data.json file in order to find the color of the tube needed
var get_tube_color = function(specimen) {
  //console.log('in get_tube_color');
  var words_space = specimen.toLowerCase().split(' ');
  var words = [];
  for (var i=0; i<words_space.length; i++) {
    var words_slash = words_space[i].split('/');
    for (var j=0; j<words_slash.length; j++) {
      words.push(words_slash[j]);
    }
  }
  //console.log('words -> ' + words);
  var colors = ['royal blue', 'red', 'light blue', 'gold', 'green', 'tan', 'yellow', 'pink', 'pearl', 'lavender'];
  for (var i=0; i<words.length; i++) {
    /*if (colors.includes(words[i])) {
      return words[i];
    }*/
    var matches = colors.filter(function(color) {
      return color == words[i];
    });
    if (matches.length == 1) {
      return matches[0];
    }
    else if ((words[i] == 'royal' || words[i] == 'light') && words[i+1] == 'blue') {
      return words[i] + ' ' + words[i+1];
    }
  }
}
exports.get_tube_color = get_tube_color;

// receives the list of tests, populates an input_map based on tube color, and then constructs the output string using several helper methods
var get_multiple_tests_response = function(tests) {
  console.log(tests);
  var s = "";
  var input_map = {};
  for (var i = 0; i < tests.length; i++) {
      var test = tests[i];
      //var amount_needed_for_test = data[test]['amount'];
      //var tube_color = data[test]['tube'];
      var specimen_string = data[camelize(test)]['data']['Specimen'];
      console.log('specimen_string -> ' + specimen_string);
      var amount_needed_for_test = get_amount_needed(specimen_string);
      var tube_color = get_tube_color(specimen_string);
      if (input_map.hasOwnProperty(tube_color)) {
        input_map[tube_color].tests.push(test);
        input_map[tube_color].total += amount_needed_for_test;
      }
      else {
        input_map[tube_color] = {tests: [test], total: amount_needed_for_test};
      }
  }
  console.log('input_map -> ' + JSON.stringify(input_map));
  for (var t in input_map) {
    //console.log(t.toUpperCase() + '!!!');
    var tube_vol = tubes[t]['vol'];
    //console.log('tube_vol -> ' + tube_vol);
    s += get_prefix(input_map[t].tests) + get_tubes_output(t, get_num_of_tubes_needed(input_map[t].total, tube_vol));
    console.log(s);
    s = regularize(s, 0);
    console.log(s);
  }
  return s;
};

// fixes spacing between multiple sentences
var regularize = function(output, start) {
  var i = output.indexOf('.', start);
  if (i == -1) {
    return output;
  }
  else {
    if (output[i+1] != ' ') {
      output = output.slice(0, i+1) + ' ' + output.slice(i+1);
      start = i+2;
    }
    else {
      start = i+1;
    }
    return regularize(output, start);
  }
};

// constructs substring w/ tube number and color (e.g. '2 royal blue tubes')
var get_tubes_output = function(color, num) {
  return num + ' ' + color + (num > 1 ? ' tubes.' : ' tube.');
};

// calculates number of tubes of a particular color that are needed
var get_num_of_tubes_needed = function(amount, vol) {
  if (amount <= vol) {
    return 1;
  }
  else {
    console.log("amount, val - > ", amount, vol);
    var div = amount/vol;
    console.log('div -> ' + div);
    var modulo = amount % vol;
    console.log('modulo -> ' + modulo);
    return Math.floor(amount / vol) + (amount % vol != 0 ? 1 : 0);
  }
};
exports.get_num_of_tubes_needed = get_num_of_tubes_needed;

// wrapper function for all the different prefix types
var get_prefix = function(tests) {
  if (tests.length == 1) {
    return get_single_prefix(tests[0]);
  }
  else if (tests.length == 2) {
    // either two tests, two panels, or 1 each
    return get_double_prefix(tests);
  }
  else {
    return get_multiple_prefix(tests);
  }
}

// simple single prefix (e.g. 'for the alcohol panel, use ')
var get_single_prefix = function(test) {
  return 'For the ' + test_or_panel_format(test) + ', use ';
}

// constructs double prefix (differentiating btw panels and tests)
var get_double_prefix = function(tests) {
  var layout = '';
  if (tests[0].includes('panel')) {
    layout = 'p';
  }
  else {
    layout = 't';
  }
  if (tests[1].includes('panel')) {
    layout += 'p';
  }
  else {
    layout += 't';
  }
  console.log('layout -> ' + layout);
  if (layout == 'pp') {
    return 'For the ' + format_panel_list(tests) + ', use ';
  }
  else if (layout == 'pt') {
    return 'For the ' + tests[0] + ' and the ' + tests[1] + ' test, use ';
  }
  else if (layout == 'tp') {
    return 'For the ' + tests[0] + ' test and the ' + tests[1] + ', use ';
  }
  else if (layout == 'tt') {
    return 'For the ' + tests[0] + ' and ' + tests[1] + ' tests, use ';
  }
};

// constructs prefix for muliple tests
var get_multiple_prefix = function(tests) {
  console.log('in get_multiple_prefix');
  var s = '';
  var panels_list = [];
  var tests_list = [];
  for (var t in tests) {
    if (tests[t].includes('panel')) {
      panels_list.push(tests[t]);
    }
    else {
      tests_list.push(tests[t]);
    }
  }
  var s = '';
  if (panels_list.length > 0) {
    if (panels_list.length == 1) {
      s += get_single_prefix(panels_list[0]);
    }
    else if (panels_list.length == 2) {
      s += get_double_prefix(panels_list);
    }
    else {
      s += 'For the ' + format_panel_list(panels_list);
    }
  }
  if (tests_list.length > 0) {
    var second = false;
    if (panels_list.length > 0) {
      var comma_loc = s.lastIndexOf(',');
      s = s.slice(0, comma_loc);
      s += ' and ';
      second = true;
    }
    if (tests_list.length == 1) {
      var p = get_single_prefix(tests_list[0]);
      if (second) {
        p = p.toLowerCase();
      }
      s += p;
    }
    else if (tests_list.length == 2) {
      var p = get_double_prefix(tests_list);
      if (second) {
        p = p.toLowerCase();
      }
      s += p;
    }
    else {
      var p = 'For the ';
      if (second) {
        p = p.toLowerCase();
      }
      s += p + format_test_list(tests_list);
    }
  }
  //s += ', use ';
  return s;
};

// combines test list, uses test suffix
var format_test_list = function(list) {
  var s = combine(list);
  s += ' tests, use ';
  return s;
};

// combines panel list, uses panel suffix
var format_panel_list = function(list) {
  var panels = [];
  for (var i in list) {
    var words = list[i].split(' ');
    panels.push(words.slice(0, words.length-1).join(' '));
  }
  if (panels.length == 2) {
    return panels[0] + ' and ' + panels[1] + ' panels';
  }
  else {
    var s = combine(panels);
    s += ' panels, use ';
    return s;
  }
};

// converts test array to list w/ commas and ands
var combine = function(list) {
  var s = '';
  for (var i in list) {
    s += list[i]
    if (i < list.length-1) {
      s += ', ';
    }
    if (i == list.length-2) {
      s += 'and ';
    }
  }
  return s;
}

// returns test or panel
var test_or_panel_format = function(test) {
  var s = ''
  if (test.includes('panel')) {
    s = test;
    return s;
  }
  s = test + ' test';
  return s;
};

// receives test from input, finds corresponding entry in data.json file
var get_tests = function(test) {
    var words = get_words(test);
    console.log(words);
    words = strip_ands(words);
    console.log('after strip ands -> ' + words);
    var tests = [];
    var current = "";
    for (var i = 0; i < words.length; i++) {
        if (current.length > 0) {
            current += " " + words[i];
        } else {
            current = words[i];
        }
        console.log('current -> ' + current);
        if (data.hasOwnProperty(camelize(current))) {
            console.log('data has property');
            tests.push(current);
            current = "";
        } else if (test_map.hasOwnProperty(current)) {
            console.log('test_map has property');
            tests.push(test_map[current]);
            current = "";
        } else if (data.hasOwnProperty(current.toUpperCase())) {
            console.log('data has uppercase property');
            tests.push(current.toUpperCase());
            current = "";
        }
    }
    return tests;
};

// strips ands from raw sentence containing multiple tests
var strip_ands = function(words) {
    var new_words = [];
    for (var i = 0; i < words.length; i++) {
        if (words[i] != 'and') {
            new_words.push(words[i]);
        }
    }
    return new_words;
};

// gets words from raw sentence containing multiple tests
var get_words = function(test) {
    var words = [];
    var current = "";
    for (var i = 0; i < test.length; i++) {
        if (test.charCodeAt(i) != 32) {
            // dont' include dots
            if (test.charCodeAt(i) != 46) {
                current += test[i];
            }
        } else {
            words.push(current);
            current = "";
        }
    }
    words.push(current);
    return words;
};

// tube objects w/ relevant information, only utilizing volume for now
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
exports.tubes = tubes;
