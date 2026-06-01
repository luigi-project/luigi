/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}'],
  roots: ['test'],
  testEnvironment: '@happy-dom/jest-environment',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(svelte|esm-env)/)'],
  verbose: true
};

module.exports = config;
