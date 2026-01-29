# Architectural Enforcement

This directory is intended to house the tools and rules for ensuring the structural integrity of the Ṛta framework and applications built upon it.

## Vision

The goal is to move architectural constraints from documentation into the automated test suite and build pipeline, preventing "architectural drift" before it happens.

## Proposed Components

### 1. `ArchitectureGuard.ts`
The core engine for running architectural checks. It should provide a fluent API for defining constraints.

### 2. ForbiddenScan
A tool to scan the codebase for prohibited APIs in specific layers.
- **Domain Layer**: Should be "pure". Forbidden: `fs`, `http`, `Date.now()`, `Math.random()`, or any direct database drivers.
- **Application Layer**: Forbidden: direct database drivers or infrastructure-specific libraries.

### 3. BoundaryCheck
A tool to validate import boundaries between layers.
- **Rule**: Domain MUST NOT import from Application, Adapters, or Infrastructure.
- **Rule**: Application MUST NOT import from Adapters or Infrastructure.
- **Rule**: Adapters MUST NOT import from other Adapters.
- **Rule**: Everything MUST NOT import from `src/core` internals not exported by `src/core/index.ts`.

### 4. TraceShapeRule
Ensures that all Primary Adapters and Use Cases start a span and that the span covers the entire execution.

### 5. CapabilityRule
Ensures that any method requiring a `CommandCtx` or `SystemCtx` actually performs a capability check.

## Implementation Ideas

- **AST Analysis**: Use `ts-morph` or `typescript` compiler API to analyze imports and function calls.
- **Dependency Graphs**: Use tools like `dependency-cruiser` to define and enforce layer boundaries.
- **Custom ESLint Rules**: Many of these constraints can be implemented as custom ESLint rules for real-time feedback in the IDE.
- **Test-Time Integration**: The `rita-guard` CLI tool can be run as part of the `npm test` or `pre-commit` hook.

## Sources of Truth
- `hexagon.yaml`: Should define the intended roles and dependencies of a module.
- `src/core/index.ts`: Defines the public API of the framework.
- `docs/architecture/`: The ultimate reference for intended structure.
