/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}'],
  roots: ['test'],
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    url: 'http://localhost/',
    // Allow stubbing window.location and other non-configurable properties
    resources: 'usable',
    runScripts: 'dangerously'
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(svelte)/)'],
  verbose: true
};

module.exports = config;
