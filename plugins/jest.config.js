/** @type {import('jest').Config} */
const config = {
  collectCoverage: true,
  collectCoverageFrom: ['auth/src/**/*.js', '!**/node_modules/**'],
  coverageDirectory: 'auth/coverage',
  rootDir: '.',
  roots: ['auth/test'],
  testEnvironment: '@happy-dom/jest-environment',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  setupFiles: ['<rootDir>/auth/test/setup.js'],
  transform: {
    '\\.js$': ['babel-jest', { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] }]
  },
  verbose: true
};

module.exports = config;
