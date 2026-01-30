import { StrictSecondaryAdapter } from '../StrictSecondaryAdapter';
import { OperationScope } from '../../../core/scope/OperationScope';
import { ContextFactory } from '../../../core/context/promotion/ContextFactory';
import { z } from 'zod';

// Concrete implementation
class ExternalApiAdapter extends StrictSecondaryAdapter<{ id: string }, string> {
    protected get outboundSchema() {
        return z.object({
            id: z.string().min(3)
        });
    }

    protected async onCall(input: { id: string; }, headers: Record<string, string>): Promise<string> {
        return `Called ${input.id} with trace ${headers['x-trace-id']}`;
    }
}

describe('StrictSecondaryAdapter', () => {
    it('should validate outbound schema', async () => {
        const adapter = new ExternalApiAdapter();
        const ctx = ContextFactory.createExternal('test-trace');
        const int = ContextFactory.promoteToInternal(ctx);
        const scope = OperationScope.create(int);

        // Fail Validation
        await expect(adapter.call(scope, { id: 'no' }))
            .rejects.toThrow();

        // Pass Validation
        const result = await adapter.call(scope, { id: 'yes' });
        expect(result).toContain('Called yes');
    });

    it('should propagate headers', async () => {
        const adapter = new ExternalApiAdapter();
        const ctx = ContextFactory.createExternal('trace-123');
        const int = ContextFactory.promoteToInternal(ctx, 'user-x');
        const scope = OperationScope.create(int);

        const result = await adapter.call(scope, { id: 'api' });

        expect(result).toContain('trace-123');
    });
});
