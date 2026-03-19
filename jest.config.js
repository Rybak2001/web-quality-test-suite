/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterSetup: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.module.ts', '!src/main.ts'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '^@app/(.*)$': '<rootDir>/src/app/$1'
  }
};
