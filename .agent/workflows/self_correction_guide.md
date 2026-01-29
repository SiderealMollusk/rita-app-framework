---
description: How to avoid "Shotgun Debugging" and frequent Lint/Test failures
---

# Self-Correction Guide: "Stop, Read, Type"

## 1. Why Failures Happen (The Root Cause)
Recent regressions (Clock rename, BehaviorSpec refactor) shared the same pattern:
1.  **Blind Search/Replacements**: Using `sed` or simple string replacements without checking for collision (e.g., creating duplicate class definitions in `Clock.ts`).
2.  **Lazy Typing**: Introducing `any` in tests (`let input: any`) to save time, which ESLint immediately flagged.
3.  **Assuming Success**: Running `npm test` *after* a batch of changes instead of incrementally verifying complex refactors.
4.  **Partial Context**: Editing a file (like `PlaceOrder.spec.ts`) without reading its imports or the types defined in the system.

## 2. The Protocol

### A. BEFORE Editing for Refactor
1.  **Read the Definition**: If renaming a class/type, `view_file` the definition *first*.
2.  **Check Usage**: `grep` for the term to gauge impact.
3.  **Plan the Type**: If introducing a variable in a test, find the correct Type (Input/Output) first. Do not use `any`.

### B. DURING Edit
1.  **Prefer `replace_file_content`**: Use precise target/replacement blocks. Avoid `sed` for code logic unless it's a pure string literal replacement.
2.  **Check for Collisions**: Did `replace_file_content` append a new block instead of replacing? (Common with abstract/concrete class mixes).

### C. AFTER Edit (The "Auto-Run" Rule)
If you touch TS code:
1.  **Lint First**: `npm run lint` is faster than `jest`. Fail fast on types.
2.  **Test Targeted**: Run `npm test <filename>` for the file you touched. Don't run the whole suite until the unit passes.

## 3. Persistent Core Memory
* "Speed is irrelevant if the build breaks."
* "Compilation errors > Runtime errors > Lint errors."
* "Mocking with `any` is a debt that gets paid immediately."
