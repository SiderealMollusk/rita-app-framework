import { BaseRepository } from '../../src/system/persistence/BaseRepository';
import { CommitScope } from '../../src/system/persistence/CommitScope';
import { Order } from './Order';



export class OrderRepository extends BaseRepository<Order> {
    // In-Memory Log (Acting as DB)
    public readonly savedOrders: Order[] = [];

    protected getId(entity: Order): string {
        return entity._data.id;
    }

    protected getVersion(entity: Order): number | undefined {
        // No optimistic concurrency in this simple demo yet
        return undefined;
    }


    protected async _write(scope: CommitScope, id: string, data: Order, _expectedVersion?: number): Promise<void> {

        // In a real app, scope would hold the transaction. 
        // Here we just verify scope exists (which TS ensures).

        // Simulating DB Write
        // We use 'safeExecute' available from BaseGateway, but we need a context.
        // BaseRepository limitation discovered earlier: _write doesn't pass ctx!

        // WORKAROUND for Demo: Just write. 
        // In real world, Scope would carry context or Tracing would be attached to Scope.
        this.savedOrders.push(data);
    }
}

