var ast = require("alexa-skill-tester");
var path = require("path");
const mock_context = require('aws-lambda-mock-context');
var module_under_test = require("../index");

describe("Event tests", function(done) {
    ast(module_under_test.handler, path.resolve(__dirname, "./events/multiple"), done);
});

/*var event = {
  "version": "1.0",
  "session": {
    "new": true,
    "sessionId": "SessionId.8bfc1294-d28c-489b-8014-fff7e09197b8",
    "application": {
      "applicationId": "amzn1.ask.skill.b229e3a0-3ac1-4d0d-9c3b-cbf8131bde8d"
    },
    "attributes": {},
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
          "value": "alcohol panel"
        }
      }
    },
    "inDialog": false
  }
};

describe("Event tests", function(done) {
    //ast(module_under_test.handler, path.resolve(__dirname, "./events/multiple"), done);
    it(filename, function (testcase_done) {
      const testcase_filename = path.join(path_to_tests, filename);
      const file_content = JSON.parse(fs.readFileSync(path.join(path_to_tests, filename)));
      const context = mock_context();
      method_under_test(file_content, context);
      context.Promise.then(response => {
        if(expect_failure) {
          return testcase_done("Test case should have failed, but instead succeeded - " + JSON.stringify(response, null, 2));
        }
        matches_expected_response(response, testcase_filename, testcase_done);
      })
      .catch(err => {
        if(!expect_failure) {
          return testcase_done(err);
        }
        matches_expected_response(err.message, testcase_filename, testcase_done);
      });
    });
    var handler = module_under_test.handler;
    var context = mock_context();
    console.log(context);
    handler(event, context);
    context.Promise.then(response => {
      console.log('success!');
      console.log(response);
    })
    .catch(err => {
      console.log('err -> ' + err);
    });
});*/
