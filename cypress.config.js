/*
* Setting up configuration parameters for a test suite.
* It sets up viewport size, timeouts, environment variables
* and other test-specific parameters. It also allows for the disabling
* of Chrome web security and the ability to take screenshots on test failure.
*/
require('dotenv').config();

const config = {
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    defaultCommandTimeout: 60_000,
    numTestsKeptInMemory: 0,
    env: {
        TEST_TOKEN: process.env.TEST_TOKEN,
        TEST_USERNAME: process.env.TEST_USERNAME,
        TEST_ID: process.env.TEST_ID,
        TEST_EMAIL: process.env.TEST_EMAIL,
    },
    e2e: {},
};

module.exports = config;

1
