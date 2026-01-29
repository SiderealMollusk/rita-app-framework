# Rita App Framework

**A Governed Execution Environment for LLM-Generated Applications.**

The Rita Framework is designed to turn TypeScript into a Domain-Specific Language (DSL) for "Governed Execution". It forces even "lazy" agents (like LLMs) to write code that is safe, attributable, and architecturally sound.

## Core Philosophy

1.  **Immutability**: Domain objects (`BaseValueObject`, `BaseEntity`) are immutable by default.
2.  **Attribution**: Every state change `_evolve()` requires a `PolicyToken` and a `Reason`, creating an unbroken audit trail.
3.  **Traceability**: Every execution unit (`BaseComponent`) automatically manages Distributed Tracing (`traceId`) and Error Recording.
4.  **Separation of Concerns**: We enforce a strict Hexagonal Architecture.

## Architecture (The Glossary)

The framework is built on strict definitions. See [docs/GLOSSARY.md](docs/GLOSSARY.md) for the authoritative dictionary.

*   **Hexagon**: The boundary of a Feature.
*   **Interaction**: A Use Case (e.g., `PlaceOrder`).
*   **Gateway**: A Secondary Adapter (e.g., `OrderRepository`).
*   **Policy**: Pure Domain Logic (e.g., `PriorityPolicy`).

## Roadmap

See [docs/ROADMAP.md](docs/ROADMAP.md) for the active development plan.

## Quick Start

```bash
# Install dependencies
npm install

# Run Tests
npm test

# Run Lint
npm run lint
```
