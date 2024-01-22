const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig');

module.exports = {
    roots: ['src'],
    testMatch: ['**/__tests__/**/*.test.+(ts|tsx|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    verbose: true,
    preset: 'ts-jest',
    modulePaths: [compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
    coverageThreshold: {
        global: {
            branches: 60,
            functions: 100,
            lines: 80,
            statements: -10,
        },
    },
};
