# 011_vip_tagging: Implementation Plan

## Goal
Implement a Context-Aware Policy example.
We will "Tag" an order based on:
1.  **User Context** (Gold/Platinum tier)
2.  **Order Value** (High value items)

## Components

### 1. The Context
#### [NEW] [CustomerProfile.ts](file:///Users/virgil/Dev/rita-app-framework/dev-demo/011_vip_tagging/CustomerProfile.ts)
- Simple Value Object (or just a type) representing the external user data.
- `{ userId: string, tier: 'STD' | 'GOLD' | 'PLAT' }`

### 2. The Gateway (Stub)
#### [NEW] [UserGateway.ts](file:///Users/virgil/Dev/rita-app-framework/dev-demo/011_vip_tagging/UserGateway.ts)
- Extends `BaseGateway`.
- `getUser(id: string): Promise<CustomerProfile>`
- **Stub Implementation**: Returns hardcoded "Gold" user for ID 'u1', "Std" for others.

### 3. The Pure Logic
#### [NEW] [PriorityPolicy.ts](file:///Users/virgil/Dev/rita-app-framework/dev-demo/011_vip_tagging/PriorityPolicy.ts)
- Extends `DecisionPolicy<Order, CustomerProfile>`.
- **Rule 1**: If `profile.tier` is 'GOLD' OR 'PLAT', set `Order.priority` = 'HIGH'.
- **Rule 2**: If `Order.total` > 1000, set `Order.priority` = 'CRITICAL'.

### 4. The Use Case
#### [NEW] [TagOrder.ts](file:///Users/virgil/Dev/rita-app-framework/dev-demo/011_vip_tagging/TagOrder.ts)
- Orchestrates:
    1.  Gateway.getUser(userId)
    2.  Policy.execute(order, userProfile)
    3.  Repo.save(order)

### 5. Verification
#### [NEW] [TagOrder.spec.ts](file:///Users/virgil/Dev/rita-app-framework/dev-demo/011_vip_tagging/TagOrder.spec.ts)
- Scenarios:
    - Gold User -> High Priority
    - Std User + High Value -> Critical Priority
    - Std User + Low Value -> Normal Priority
