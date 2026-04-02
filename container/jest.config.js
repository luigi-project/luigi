module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
      url: 'http://localhost/',
      resources: 'usable',
      runScripts: 'dangerously'
    },
    roots: ['test'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}'],
    coverageReporters: ['clover', 'json', 'json-summary', 'lcov', 'text'],
    coverageDirectory: 'coverage'
  };
};
