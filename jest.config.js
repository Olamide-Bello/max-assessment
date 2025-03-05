module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./src/tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/tests/**',
    '!src/config/**'
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '**/tests/**/*.test.js'
  ]
};