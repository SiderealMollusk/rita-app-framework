# Domain Glossary

This document defines the ubiquitous language for the Framework. All code, documentation, and discussions should adhere to these terms.

## Core Concepts

| Term | Definition | Previous Jargon |
| :--- | :--- | :--- |
| **Hexagon** | The boundary of a Feature or Component, implementing the Ports & Adapters pattern. It defines strict inputs (Primary Ports) and outputs (Secondary Ports). | - |
| **Interaction** | A single Use Case or Interactor (Application Layer). It coordinates Domain Entities and Value Objects to achieve a business goal. | `The Hole` (Implementation) |
| **Gateway** | A Secondary Adapter (Infrastructure Layer) that abstracts external systems (Databases, APIs). | - |
| **Policy** | pure Domain Logic that encapsulates complex decision trees. It is side-effect free and deterministic. | - |
| **SystemCtx** | The Transactional Context passed through every layer. It carries Trace IDs and optional capabilities (like Commit). | `RitaCtx` |
| **Contract** | The guarantees provided by the base classes (e.g., "Entities are only mutated via Policies"). | `Invisible Railings` |

## Code Structure

### Base Classes
*   **BaseComponent**: The root of all executable units (Interactions, Queries). Enforces Tracing and Error Handling.
*   **BaseEntity**: A Domain Object with an Identity. Mutable only via strict `evolve()` patterns.
*   **BaseValueObject**: An immutable Domain Object defined by its attributes.

### Patterns
*   **Governed Execution**: The philosophy that code is not just "run", but "managed" by the framework to ensure safety and auditability.
*   **Semantic Locking**: The use of Types (like `PolicyToken`) to prove that a logical check has been performed before an action is allowed.
