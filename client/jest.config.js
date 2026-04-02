/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
    resources: 'usable',
    runScripts: 'dangerously'
  }
};

module.exports = config;
