# Unit Testing Policy: "The 100% Goal"

## 1. The Golden Rule
**Every line of code committed to the repository must be covered by an automated test.**

Goal: **100% Coverage.**

## 2. Exemptions (The 15% Allowance)
We acknowledge that some code is boiler-plate, configuration, or structural wiring that provides diminishing returns to unit test. These files may be **exempted** but must be explicitly marked.

### Allowed Exemptions:
1.  **Top-Level Entry Points**: `src/run.ts`, `src/index.ts` (Bootstrapping code).
2.  **Configuration Files**: `jest.config.js`, `eslint.config.mjs`.
3.  **Strictly Typed Manifests**: files like `hex.ts` (if purely declarative).

> **Note on "Un-Unit-Testable" Code**: If a file is difficult to unit test but is better covered by an Integration, E2E, or Schema Validation test, it may be exempted from *Unit* coverage requirements provided it is explicitly covered by that **Better Method**.


## 3. Coverage Strategy

| Layer | Strategy | Type |
| :--- | :--- | :--- |
| **Domain (Policies, ValueObjects)** | TDD. Strict Branch Coverage. | Unit |
| **Application (Use Cases)** | TDD. Mock Gateways. | Unit |
| **Interfaces (Controllers)** | Input Validation & Response Mapping. | Unit |
| **Infrastructure (Repositories)** | In-Memory mocks for Logic; Integration tests for real DBs. | Integration/Unit |
| **System (Clock, Logger)** | Mock-heavy/Contract tests. | Unit |

## 4. Enforcement
- **CI/CD**: The build will fail if coverage drops below **100%** (calculated on non-exempt files).
- **Linter**: Unused code should be removed, not untested.
