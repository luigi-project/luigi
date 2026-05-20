module.exports = {
  testEnvironment: '@happy-dom/jest-environment',
  testEnvironmentOptions: {
    url: 'http://localhost/'
  },
  roots: ['projects/client-support-angular/src'],
  testMatch: ['**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'projects/client-support-angular/tsconfig.spec.json'
      }
    ]
  },
  verbose: true,
  collectCoverage: true,
  collectCoverageFrom: ['projects/client-support-angular/src/**/*.ts', '!**/*.spec.ts', '!**/test.ts']
};
