module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverage: true,
    coverageReporters: ["html", "text", "text-summary", "cobertura"],
    testMatch: [
      '**/test/**/*.ts'
    ],
    verbose: true,
    collectCoverageFrom: [
      '**/src/**/*.ts'
    ],
    testPathIgnorePatterns: [
      'dist.*\\.ts$',
      'test-data\.ts'
    ]
  }
  