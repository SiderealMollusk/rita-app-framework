import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
// import globals from "globals"; // If we needed browser/node globals

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["dist/**", "node_modules/**", "coverage/**", "jest.config.js"],
    },
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "error",

            "@typescript-eslint/no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],

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
            // Architectural Boundaries
            "no-restricted-imports": [
                "error",
                {
                    "paths": [
                        {
                            "name": "src/system/persistence/CommitScope",
                            "importNames": ["CommitScope"],
                            "message": "Do not import CommitScope directly. Use the CommitScope type definition if needed, but implementation details are restricted."
                        }
                    ]
                }
            ]
        }
    },
    // --- Overrides via Flat Config (just another object in the array) ---
    {
        // Policies should be PURE LOGIC.
        files: ["src/system/DecisionPolicy.ts", "src/**/policies/*.ts"],
        rules: {
            "no-restricted-imports": ["error", {
                "patterns": [{
                    "group": ["**/persistence/*", "**/BaseGateway"],
                    "message": "Policies must be pure. Do not import persistence or gateways."
                }]
            }]
        }
    },
    {
        // Queries should NOT write.
        files: ["src/system/cqrs/BaseQuery.ts", "src/**/queries/*.ts"],
        rules: {
            "no-restricted-imports": ["error", {
                "patterns": [{
                    "group": ["**/persistence/CommitScope"],
                    "message": "Queries cannot write. Do not import CommitScope."
                }]
            }]
        }
    },
    {
        // Clock is allowed to use Date
        files: ["src/system/Clock.ts"],
        rules: {
            "no-restricted-syntax": "off"
        }
    },
    {
        // Framework Base Classes need 'any' for generic defaulting
        files: [
            "src/system/BaseInteraction.ts",
            "src/system/BaseComponent.ts",
            "src/system/BaseGateway.ts",
            "src/system/telemetry/Logger.ts",
            "src/system/DecisionPolicy.ts",
            "src/system/BehaviorSpec.ts"
        ],
        rules: {
            "@typescript-eslint/no-explicit-any": "off"
        }
    }

);
