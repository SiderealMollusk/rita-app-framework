# Ṛta App Framework

**A Governed Execution Environment for LLM-Generated Applications.**

The Ṛta Framework turns TypeScript into a Domain-Specific Language (DSL) for "Governed Execution". It forces even "lazy" agents (like LLMs) to write code that is safe, attributable, and architecturally sound.

## Core Philosophy

1.  **Immutability**: Domain objects are immutable by default.
2.  **Attribution**: Every state change requires an authorized `PolicyToken` and a `Reason`.
3.  **Traceability**: Every operation is governed by an `OperationScope` with mandatory distributed tracing.
4.  **Strict Enforcement**: Architectural boundaries are enforced via types and automated scans.

## Documentation

The authoritative documentation is located in the [docs/architecture/](docs/architecture/) directory.

- **[Table of Contents](docs/architecture/TableOfContents.md)**: Your starting point for all framework documentation.
- **[The Glossary](docs/architecture/GLOSSARY.md)**: Authoritative dictionary of terminology.
- **[Parts List](docs/architecture/10_parts_list.md)**: Inventory of all core concepts.
- **[Contracts & Boundaries](docs/architecture/20_contracts_and_boundaries.md)**: The "Law" of the framework.

## Architecture

Ṛta enforces a **Strict Hexagonal Architecture** using the `OperationScope` primitive and the `Strict*` suite of base classes.

- **Hexagon**: The boundary of a Feature.
- **Interaction**: A Use Case (e.g., `PlaceOrder`).
- **Gateway**: A Secondary Adapter (e.g., `OrderRepository`).
- **Policy**: Pure Domain Logic (e.g., `PriorityPolicy`).

## Quick Start

```bash
# Install dependencies
npm install

# Run Tests
npm test

# Run Lint
npm run lint
```
