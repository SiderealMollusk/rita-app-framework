# Governed Logging Specification (V2)

**Status:** Mandatory for all Rita-compatible applications.
**Format:** JSON Lines (JSONL).

## 1. Log Entry Schema

Every log entry must be a valid JSON object with the following fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `ISO8601` | Precise time from the `RitaClock` (or `SimulatedClock`). |
| `level` | `string` | `INFO`, `ERROR`, `DEBUG`, `TRACE`. |
| `traceId` | `UUID` | Consistent across the entire execution flow. |
| `spanId` | `UUID` | Unique to the current component execution. |
| `component` | `string` | Name of the Hexagon component (e.g. `PlaceOrderUseCase`). |
| `message` | `string` | Human-readable description. |
| `metadata` | `Object` | Arbitrary structured data. |
| `snapshot` | `Object` | (Optional) Full state of the primary entity after mutation. |
| `evolution` | `Object` | (Optional) The specific delta applied via `_evolve()`. |

## 2. Event Types

### 2.1 System Events
- `[Component: Start]`: Logged when a `BaseComponent` begins execution.
- `[Component: End]`: Logged when it completes.
- `[Component: Error]`: Logged on failure with full stack trace in metadata.

### 2.2 Domain Events
- `[Evolution]`: Logged by `DecisionPolicy` whenever a state change is authorized. MUST include the `reason`.

### 2.3 Simulation Events
- `[Sim: Wait]`: Logged when the clock is advanced.
- `[Sim: Act]`: Logged when the simulator triggers an interaction.

## 3. Snapshot Strategy

To enable high-fidelity UI playback:
1. Every `[Evolution]` log MUST include a `snapshot` of the entity's `_data`.
2. This creates a "Keyframe" that the UI viewer can use to render the system state at that exact micro-second without re-calculating deltas.

## 4. Example Log Line

```json
{"timestamp":"2026-01-29T12:00:01.000Z","level":"INFO","traceId":"a-b-c","component":"KitchenWorkflow","message":"Item Cooked","evolution":{"status":"COOKED"},"reason":"Timer Expired","snapshot":{"id":"tk-1","items":[{"id":"i1","status":"COOKED"}]}}
```
