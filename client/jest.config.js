module.exports = async () => {
  return {
    verbose: true,
    testEnvironment: '@happy-dom/jest-environment',
    testEnvironmentOptions: {
      url: 'http://localhost/',
    },
    roots: ['test'],
  };
};
