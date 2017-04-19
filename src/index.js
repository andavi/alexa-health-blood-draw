'use strict';
var Alexa = require("alexa-sdk");
var fs = require("fs");

var file_name = 'old_data.json';
var data = JSON.parse(fs.readFileSync(file_name));

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
        //this.emit(':ask', 'Welcome to the Blood Draw skill! Which test would you like to know about?', 'Please specify a test.');
        var launch_response = 'Welcome to the Blood Draw skill! If you would like to know about a single test, say 1. If you would like to know about multiple tests, say 2.';
        var launch_reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
        this.emit(':ask', launch_response, launch_reprompt);
    },
    'AMAZON.NoIntent': function() {
        this.emit(':tell', 'Goodbye');
    },
    'AMAZON.CancelIntent': function() {
        this.emit(':tell', 'Goodbye');
    },
    'ProcessOneOrTwoIntent': function() {
        console.log('in ProcessOneOrTwoIntent:');
        var answer = this.event.request.intent.slots.OneOrTwo.value.toLowerCase();
        console.log(answer);
        if (answer == 1) {
          Object.assign(this.attributes, {
            "mode": "single_test"
          });
          var response = 'What test would you like to know about?';
          var reprompt = 'Please specify which test you would like to know about.';
          this.emit(':ask', response, reprompt);
        }
        else if (answer == 2) {
          Object.assign(this.attributes, {
            "mode": "multiple_tests"
          });
          var response = 'How many tests would you like to know about?';
          var reprompt = 'Please specify how many tests you would like to know about.';
          this.emit(':ask', response, reprompt);
        }
        else {
          console.log('got answer that wasn\'t 1 or 2 -> ' + answer);
          var response = 'Sorry, we didn\'t quite get that. Please say either 1 for a single test, or 2 for multiple tests.';
          var reprompt = 'Please say either 1 for a single test, or 2 for multiple tests.';
          this.emit(':ask', response, reprompt);
        }
    },
    'GetTubeIntent': function() {
        console.log('in GetTubeIntent');
        console.log('current attributes: ');
        console.log(this.attributes);
        var test_data = this.event.request.intent.slots.Test.value.toLowerCase();
        console.log('test_data -> ' + test_data);
        var tests = get_tests(test_data);
        console.log(tests);
        var s = "";
        if (this.attributes.hasOwnProperty('mode')) {
          console.log('has mode property');
          if (this.attributes.mode == 'single_test') {
            console.log('mode -> single_test');
            var test = tests[0];
            var amount_needed_for_test = data[test]['amount'];
            var tube_color = data[test]['tube'];
            var tube_vol = tubes[tube_color]['vol'];
            var num_of_tubes_needed = get_num_of_tubes_needed(amount_needed_for_test, tube_vol);
            s += get_prefix(tests) + get_tubes_output(tube_color, num_of_tubes_needed);
            console.log(s);
          }
          else if (this.attributes.mode == 'multiple_tests') {
            console.log('mode -> multiple_tests');
          }
        }
        else {
          console.log('no mode property');
        }

        /*var test_data = this.event.request.intent.slots.Test.value.toLowerCase();
        console.log('test_data -> ' + test_data);
        var tests = get_tests(test_data);
        console.log(tests);
        var s = "";
        if (tests.length > 1) {
          var input_map = {};
          for (var i = 0; i < tests.length; i++) {
              var test = tests[i];
              var amount_needed_for_test = data[test]['amount'];
              var tube_color = data[test]['tube'];
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
            console.log(t.toUpperCase() + '!!!');
            var tube_vol = tubes[t]['vol'];
            console.log('tube_vol -> ' + tube_vol);
            s += get_prefix(input_map[t].tests) + get_tubes_output(t, get_num_of_tubes_needed(input_map[t].total, tube_vol));
            console.log(s);
            s = regularize(s, 0);
            console.log(s);
          }
        }
        else {
          console.log('only one test');
          var test = tests[0];
          var amount_needed_for_test = data[test]['amount'];
          var tube_color = data[test]['tube'];
          var tube_vol = tubes[tube_color]['vol'];
          var num_of_tubes_needed = get_num_of_tubes_needed(amount_needed_for_test, tube_vol);
          s += get_prefix(tests) + get_tubes_output(tube_color, num_of_tubes_needed);
          console.log(s);
        }*/
        this.emit(':ask', s + ' Anything else?', 'Are there any other tests you\'d like to know about?');
    }
};

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

var get_tubes_output = function(color, num) {
  return num + ' ' + color + (num > 1 ? ' tubes.' : ' tube.');
};

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

var get_single_prefix = function(test) {
  return 'For the ' + test_or_panel_format(test) + ', use ';
}

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

var format_test_list = function(list) {
  /*var s = '';
  for (var i in list) {
    s += list[i]
    if (i < list.length-1) {
      s += ', ';
    }
    if (i == list.length-2) {
      s += 'and ';
    }
  }*/
  var s = combine(list);
  s += ' tests, use ';
  return s;
};

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
    /*var s = '';
    for (var p in panels) {
      s += panels[p]
      if (p < panels.length-1) {
        s += ', ';
      }
      if (p == panels.length-2) {
        s += 'and ';
      }
    }*/
    var s = combine(panels);
    s += ' panels, use ';
    return s;
  }
};

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

var test_or_panel_format = function(test) {
  var s = ''
  if (test.includes('panel')) {
    s = test;
    return s;
  }
  s = test + ' test';
  return s;
};

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
        if (data.hasOwnProperty(current)) {
            tests.push(current);
            current = "";
        } else if (test_map.hasOwnProperty(current)) {
            tests.push(test_map[current]);
            current = "";
        }
    }
    return tests;
};

var strip_ands = function(words) {
    var new_words = [];
    for (var i = 0; i < words.length; i++) {
        if (words[i] != 'and') {
            new_words.push(words[i]);
        }
    }
    return new_words;
};

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
    "vitamin b 12": "vitamin b12 level",
    "b 12": "vitamin b12 level",
    "b 12 level": "vitamin b12 level",
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
