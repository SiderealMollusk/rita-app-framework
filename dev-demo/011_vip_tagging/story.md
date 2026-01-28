# The Story of a Priority Order

This data is captured from a real execution trace of `dev-demo/011_vip_tagging`.

## The Scene
**User**: `u_gold` (A Loyal "Gold Tier" Customer)
**Action**: Places a small order request ($50).
**Goal**: The system must decide the `Order Priority`.

---

## 1. The Interaction (Inbound)
The **Controller** (`TagOrderController`) receives the raw input.
> 📝 **Log**: `[TagOrder] Started input={"userId":"u_gold", "amount":50}`

It validates the input (e.g. checks userId exists) and delegates to the Use Case.

## 2. The Use Case (Core)
The **Use Case** (`TagOrder`) wakes up. It needs context to make a decision.

### Step 2a: Fetching Context (Outbound)
It calls the **Gateway** (`UserGateway`) to look up the user.
> ⏱️ **Span**: `[Gateway] UserGateway:getUser` (8ms)
> 📝 **Log**: `[Gateway] UserGateway:getUser succeeded`

The Gateway returns a `CustomerProfile` with `{ tier: 'GOLD' }`.

## 3. The Logic (Pure Policy)
Now the Use Case has the **Target** (Order) and **Context** (Profile).
It hands them to the **Policy** (`PriorityPolicy`).

> ⏱️ **Span**: `PriorityPolicy` (3ms)
> 📝 **Log**: `[Policy] Evaluated matched=true`
> 🔍 **Trace**: `[Op] Order.priority (NORMAL) === NORMAL == true`

**The Decision:**
The Policy sees the user is 'GOLD'. It decides to **evolve** the order.
> 📝 **Log**: `[Policy] MATCHED. Evolving State...`

The Order is now `HIGH` priority.

## 4. The Persistence (Outbound)
The Use Case saves the result via the **OrderRepository**.

> ⏱️ **Span**: `OrderRepository:saveOrder` (1ms)
> 📝 **Log**: `[Gateway] OrderRepository:saveOrder succeeded`

## 5. The Result
The Controller returns the final DTO to the world.

```json
{
  "orderId": "o1",
  "finalPriority": "HIGH",
  "note": [
    "[2026-01-27...] User is GOLD Tier"
  ]
}
```

---

## Technical Summary
*   **Total Duration**: ~25ms
*   **Touchpoints**: 1 Controller -> 1 Use Case -> 2 Gateways -> 1 Policy
*   **Logic**: Pure, Deterministic, and Auditable (see `note`).
