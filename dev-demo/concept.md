# Concept: 011_vip_tagging

## The Goal
Demonstrate a realistic "Context-Aware" decision where the Logic Engine needs data *outside* the Order itself (the Customer's profile) to make a decision.

## The Story
A customer places an order. We need to decide if this order gets **"Priority Handling"** at the warehouse.
This decision depends on:
1.  The Order Value (Intrinsic).
2.  The User's Loyalty Tier (Extrinsic / Context).

## The Flow
1.  **Controller**: Receives `userId` and `cartItems`.
2.  **Use Case**:
    *   Creates `Order` (Initial state: Standard).
    *   **Gateway**: Fetches `CustomerProfile` by `userId`.
    *   **Policy**: Executes `PriorityLabelingPolicy`.
        *   *Input*: `Order` + `CustomerProfile`.
        *   *Rule 1*: If `Customer.tier` is 'GOLD', upgrade Order to 'VIP'.
        *   *Rule 2*: If `Order.total` > $500, upgrade Order to 'INSURED'.
    *   **Gateway**: Saves `Order`.

## Key Technical Features
*   **Context Injection**: We pass `CustomerProfile` as the `Context` generic to `DecisionPolicy<Order, CustomerProfile>`.
*   **Gateway interaction**: We simulate looking up a user from a "User Service".
*   **Multiple Rules**: The policy can have multiple independent checks (demonstrating pure logic composition).

## The Code Structure
```typescript
// The Context
type CustomerProfile = { id: string; tier: 'STD' | 'GOLD' | 'PLAT' };

// The Policy
class PriorityPolicy extends DecisionPolicy<Order, CustomerProfile> {
  spec(order: Order, customer: CustomerProfile) {
     /* Logic here */ 
  }
}

// The Use Case
const profile = await userRepo.get(id);
order = policy.execute(order, profile);
```
