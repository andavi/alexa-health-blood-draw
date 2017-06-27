<h1>Blood Draw</h1>

><sub>Our group <a href="https://alexahealth.web.unc.edu/">website</a> with more information including documentation, architecture diagrams, and presentation slides given during the Software Engineering Lab course.</sub>

This <a href="https://github.com/andavi/alexa-health-blood-draw">repository</a> is for an Amazon Alexa skill prototype to be used by clinicians as a reference to help them determine the type and amount of blood draw tubes needed for a particular test or sequence of tests.


<h3>Installation</h3>

In order to use this skill with your Alexa-enabled device you will need to do two things:

<ol>
    <li>Put the contents of the speechAssets/ folder into their appropriate places at developer.amazon.com</li>
    <li>Compress the contents of the src folder (everything except for the scrape/ and test/ directories) and upload it into a Lambda function at aws.amazon.com which will be linked to the skill set up at Amazon Developer</li>
</ol>

These steps are outlined in full detail <a href="https://github.com/alexa/skill-sample-nodejs-fact">here</a>.

<h3>Use</h3>

When you open the Blood Draw skill you will be given an option of whether you want to know about a single test or multiple tests. You reply by saying either "1" for a single test or "2" for multiple tests.

<h4>Single Test Mode</h4>

The skill will ask for you for the name of the test, and after you tell it the test name, it'll reply with the relevant data and then ask if there's anything else you'd like to know about. If you would like to go back to the opening question ("single test or multiple tests"), then say yes. If you'd like to quit out of the skill, then say no.

<h4>Multiple Test Mode</h4>

The skill will first ask you how many tests you'd like to know about, and after you reply with a number from 1 to 8, it'll repeatedly ask you for the name of the i-th test (i.e. 1st test, 2nd test, etc.) until you've told it all of them. Then, just like in the single test mode, it'll reply with all of the relevant data, with the option at the end to either go back to the opening question or quit out of the skill.

<h3>Test</h3>

Navigate to the src directory and type "node_modules/.bin/mocha" into the terminal.

<h3>Possible Future Enhancements</h3>

<h4>More Extensive Testing</h4>

Ideally, there would be more test support for the multiple test mode, to make sure than any possible combination of different tests would come out to the right answer. We've tested it enough manually to be reasonably sure that it's going to come up with the right answer the vast majority of the time, but that's probably not good enough for use in a medical setting. The problem with this, however, is that it seems rather complex and infeasible from a computational perspective (with around 100 tests available, there are roughly 1x10^14 possible seven-test combinations alone).

<h4>Aliasing</h4>

To make it easier for clinicians, a nice feature to add would be the ability to set an alias for a particular test or group of tests, so as to avoid having to go through the same process over and over again. The clinician would just say the alias, and the skill would reply with the data corresponding to all of the different tests encapsulated within that alias.
