# ADR 003: The Strict Architecture Suite

**Status:** Accepted
**Context:** Enforcing architectural best practices through opinionated "Strict" base classes that leverage the `OperationScope`.
**Dependencies:** ADR 001 (OperationScope).

## 1. The "Strict" Philosophy
The Framework provides `Base*` classes which are relatively unopinionated. The `Strict*` suite (found in `src/patterns/strict/`) provides a layer of mechanical enforcement that:

1.  **Enforces Schema Validation:** Uses Zod for all inputs and outputs at the boundaries.
2.  **Mandatory OperationScope:** Requires an explicit `OperationScope` for execution, ensuring traceability and authority.
3.  **Governance of State Changes:** Ensures that state evolution only happens through authorized policies.
4.  **Transaction Integrity:** Couples repository access to the `UnitOfWork` within the scope.

## 2. The Strict Suite Components

### 2.1 StrictUseCase
Replaces `BaseUseCase`. It enforces Zod validation for both request and response and wraps execution in a managed trace span.

### 2.2 StrictEntity & StrictValueObject
Enforce that creation and state changes occur only within authorized `DecisionPolicies` by requiring a `PolicyToken`.

### 2.3 StrictPolicy
Provides a base for pure decision logic that returns evolutions, ensuring business rules are isolated from I/O and side effects.

### 2.4 StrictPrimaryAdapter
Handles the creation and promotion of `OperationScope` for incoming requests (Queries and Commands).

### 2.5 StrictRepository & StrictUnitOfWork
Ensures that data persistence is performed through a managed transaction, making it impossible to perform durable writes without a proper write scope.

## 3. Implementation Status
The `Strict` suite is implemented in `src/patterns/strict/`. All new feature development should use these classes. Existing `Base*` classes are marked as `@deprecated` to guide developers toward the strict patterns.

## 4. Benefits
- **Safety by Default:** Illegal operations (like writing without a transaction) are caught at compile-time or early runtime.
- **Improved Traceability:** Every operation is automatically linked to a trace and a principal.
- **Consistent Structure:** Forces a uniform implementation pattern across all hexagons.
