var ast = require("alexa-skill-tester");
var path = require("path");
var fs = require('fs');
const mock_context = require('aws-lambda-mock-context');
var index = require("../index");

var get_tests = function() {
  var test_map = JSON.parse(fs.readFileSync(__dirname + '/../test_map.json'));
  var data = JSON.parse(fs.readFileSync(__dirname + '/../data.json'));
  var tests = fs.readFileSync(__dirname + '/../../speechAssets/customSlotTypes/LIST_OF_TESTS', 'utf8');
  var tests_list = tests.split('\n');
  tests_list.pop();
  //var tests_list = tests_list.slice(0, 5);
  var tests_dict = {};
  var name = '';
  var color = '';
  var amount = '';
  for (var i=0; i<tests_list.length; i++) {
    name = tests_list[i];
    //console.log('name -> ' + name);
    if (!data.hasOwnProperty(name)) {
      //console.log('not in data');
      //console.log(index.camelize(test_map[name.toLowerCase()]));
      name = index.camelize(test_map[name.toLowerCase()]);
      //console.log(name);
    }
    color = index.get_tube_color(data[name]['data']['Specimen']);
    amount = index.get_amount_needed(data[name]['data']['Specimen']);
    tests_dict[tests_list[i]] = {'color': color, 'amount': amount};
  }
  //console.log(tests_dict);
  return tests_dict;
};

var get_event = function(str) {
  return {
    "version": "1.0",
    "session": {
      "new": false,
      "sessionId": "SessionId.8bfc1294-d28c-489b-8014-fff7e09197b8",
      "application": {
        "applicationId": "amzn1.ask.skill.b229e3a0-3ac1-4d0d-9c3b-cbf8131bde8d"
      },
      "attributes": {"mode": "single_test"},
      "user": {
        "userId": "amzn1.ask.account.AFX5GXODBCUHUWFQQON32LXEDGIW63SSPC2NMWEPHKOBFVKFXP4UEI5W7NE7PPFX4QHVEM5ELIOJ64D4PHQ24WPMZHOX7RFZ2IRZDOQAKNXQ6ON5KU53CKIRBMDDYBIXZFYUKGCGCDBMGI4RC3OMDIVNQTAO2M6CBPLQWP4IWQMQRVZ56RXXUCEOCNAQ2GDNMYVXW2EOSHLDT6Y"
      }
    },
    "request": {
      "type": "IntentRequest",
      "requestId": "EdwRequestId.2cd7985b-0a51-4d90-9b2a-b553339abf83",
      "timestamp": "2017-02-27T16:06:57Z",
      "locale": "en-US",
      "intent": {
        "name": "GetTubeIntent",
        "slots": {
          "Test": {
            "name": "Test",
            "value": str
          }
        }
      },
      "inDialog": true
    }
  }
};

var matches_expected_response = function(response, obj, testcase_done) {
  //console.log(JSON.stringify(response));
  //console.log(response['response']['outputSpeech']['ssml']);
  var str = response['response']['outputSpeech']['ssml'];
  if (str.includes(obj['color'])) {
    //console.log('right color');
    var needed = index.get_num_of_tubes_needed(obj['amount'], index.tubes[obj['color']]['vol']);
    console.log('need -> ' + needed);
    if (str.includes(needed.toString())) {
      //console.log('right amount');
      return testcase_done();
    }
    else {
      var msg = 'err -> wrong amount';
      //console.log(msg);
      return testcase_done(msg);
    }
  }
  else {
    var msg = 'err -> wrong color';
    //console.log(msg);
    return testcase_done(msg);
  }
};

var test = function(method_under_test, tests, done, expect_failure) {
  //for (var t in tests) {
  Object.keys(tests).forEach(function(t) {
    //console.log('top t -> ' + t);
			it(t, function (testcase_done) {
        //console.log('t -> ' + t);
			  const event = get_event(t);
				const context = mock_context();
				method_under_test(event, context);
				context.Promise.then(response => {
					if(expect_failure) {
						return testcase_done("Test case should have failed, but instead succeeded - " + JSON.stringify(response, null, 2));
					}
					matches_expected_response(response, tests[t], testcase_done);
				})
				.catch(err => {
					//if(!expect_failure) {
						return testcase_done(err);
					//}
					//matches_expected_response(err.message, testcase_filename, testcase_done);
				});
			});
    });
    //}
};

describe("Event tests", function(done) {
    var tests = get_tests();
    test(index.handler, tests, done);
});
