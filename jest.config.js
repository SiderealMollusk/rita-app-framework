/** @type {import('ts-jest').JestConfigWithTsJest} */
/* eslint-env node */
module.exports = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>/src', '<rootDir>/dev-demo'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts', 'dev-demo/**/*.ts'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '.*/run\\.ts$',
        '.*/hex\\.ts$',
        '.*\\.config\\..*'
    ],


    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100
        }
    }
};

