module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: 'jsdom',
    roots: ['test'],
    collectCoverage: true,
    transform: {
      '\\.[jt]sx?$': 'babel-jest'
    },
    collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}']
  };
};
