/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}'],
  roots: ['test'],
  setupFilesAfterEnv: ['./test/jest-setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '\\.[jt]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(svelte)/)'],
  verbose: true
};

module.exports = config;
