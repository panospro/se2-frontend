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
