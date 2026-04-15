module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: '@happy-dom/jest-environment',
    testEnvironmentOptions: {
      url: 'http://localhost/'
    },
    roots: ['test'],
    collectCoverage: true,
    transform: {
      '\\.[jt]sx?$': 'babel-jest'
    },
    transformIgnorePatterns: ['/node_modules/(?!(svelte)/)'],
    collectCoverageFrom: ['src/**/*.{js,mjs,ts,svelte}', '!**/node_modules/**', '!**/vendor/**', '!**/*.spec.{js,ts}'],
    moduleNameMapper: {
      '^@luigi-project/container$': '<rootDir>/test/mocks/container.ts'
    }
  };
};
