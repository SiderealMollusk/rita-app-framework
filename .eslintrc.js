module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    rules: {
        // Enforce Clock Usage
        "no-restricted-syntax": [
            "error",
            {
                "selector": "NewExpression[callee.name='Date']",
                "message": "Do not use 'new Date()'. Use 'RitaClock.now()' instead to ensure testability."
            },
            {
                "selector": "CallExpression[callee.object.name='Date'][callee.property.name='now']",
                "message": "Do not use 'Date.now()'. Use 'RitaClock.timestamp()' instead or 'RitaClock.now().getTime()'."
            }
        ],
        // General Sanity
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }]
    },
    ignorePatterns: [
        "dist/",
        "node_modules/",
        "src/system/Clock.ts" // Allow Date usage inside the Clock itself
    ]
};

// TODO(P1-LINT): Add no-restricted-imports boundaries: policies cannot import persistence/gateways; cqrs/query cannot import writers; domain/features cannot import system/persistence implementations directly (only ports). This makes CQRS enforcement compile-time/CI visible.

