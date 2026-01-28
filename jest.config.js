/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/dev-demo'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', 'dev-demo/**/*.ts'],
};
