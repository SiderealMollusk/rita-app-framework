# Terminology Standardization Review

This document audits the terminology usage across Ṛta (Rita) Architecture Docs vs. Implementation.

## 1. The Critical Mismatches and Non-Standard Terms

| Current Term | In Docs? | In Code? | Industry Standard | Verdict / Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **Interaction** | Yes | Yes (Heavily) | Use Case, Application Service, Interactor | **RENAME to `UseCase`**. "Interaction" implies UI or bidirectional. "Use Case" is unmistakable. |
| **Hexagon** | No | Yes (`Hexagon.ts`) | Module Config, Bounded Context, Manifest | **RENAME to `FeaturePod` or `AppModule`**. "Hexagon" is the pattern name, not the config object name. |
| **Kernel** | Yes | No (`src/system`) | Shared Kernel, Core, Framework | **KEEP `Kernel` in docs, but RENAME `src/system` to `src/kernel`**. "System" is too generic. |
| **TrustLevel** | Yes | Yes | Security Context, Auth Scope, Trust Boundary | **KEEP `TrustLevel`**. It is more specific than "Scope" (which implies permission, not structural trust). |
| **Evolution** | Yes | Yes | Domain Event, State Transition | **KEEP `Evolution`**. As discussed, "Event" implies async messaging, and "Transition" implies statemachines. "Evolution" correctly implies "History + Reason". |
| **Ingress/Egress**| Yes | No | Primary/Secondary Adapters | **ADOPT `Primary/Secondary Adapter`**. Ingress/Egress is network jargon (Kubernetes/Envoy). Hexagonal Arch calls them Adapters. |

## 2. Inconsistencies found

### A. The "System" vs "Kernel" Split
*   **Docs:** Refer to `Kernel API` (Doc 30).
*   **Code:** Lives in `src/system/`.
*   **Fix:** Renaissance move: all framework code moves to `src/kernel/`.

### B. The "Hexagon" Config
*   **Docs:** Deleted.
*   **Code:** `Hexagon.define({...})` is the entry point.
*   **Fix:** We need to canonize this concepts. If we rename it to `AppModule` or `Feature`, we can align with `10_parts_list.md`.

## 3. Proposed Schema (Renaming Plan)

If approved, the next Refactor Task will apply these Regex replacements globally:

1.  `class BaseInteraction` -> `class BaseUseCase`
2.  `Hexagon.define` -> `Rita.module` (or `Feature.define`)
3.  `src/system` -> `src/kernel`
4.  `BaseIngress` (Hypothetical) -> `BasePrimaryAdapter`
5.  `BaseGateway` -> `BaseSecondaryAdapter`

## 4. Decisions (Finalized)

*   **Interaction -> UseCase**: Approved.
*   **Hexagon -> Feature/Module**: Approved (specifically using `Feature` or `Module` terminology in code).
*   **src/system -> src/core**: Approved (following the project's existing `src/core` and the `structure_framework_runtime.md` vision).
*   **CommitScope -> UnitOfWork**: Approved.
*   **Gateway -> SecondaryAdapter**: Approved.
*   **Ingress -> PrimaryAdapter**: Approved.
