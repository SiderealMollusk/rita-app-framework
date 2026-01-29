/** @type {import('ts-jest').JestConfigWithTsJest} */
/* eslint-env node */
module.exports = {

    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts', '**/*.spec.ts'],
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '.*/run\\.ts$',
        '.*/hex\\.ts$',
        '.*\\.config\\..*',
        'src/core/index\\.ts'
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

