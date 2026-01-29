import { BasePrimaryAdapter } from '../BasePrimaryAdapter';
import { TrustLevel } from '../../context/BaseCtx';

describe('BasePrimaryAdapter', () => {
    class TestAdapter extends BasePrimaryAdapter {
        public testCreateCtx(traceId?: string) {
            return this.createExternalCtx(traceId);
        }
    }

    it('should create an external context', () => {
        const adapter = new TestAdapter();
        const ctx = adapter.testCreateCtx('test-trace');
        expect(ctx.traceId).toBe('test-trace');
        expect(ctx.trustLevel).toBe(TrustLevel.External);
    });

    it('should have a name based on the constructor', () => {
        const adapter = new TestAdapter();
        // @ts-ignore - accessing protected for test
        expect(adapter.name).toBe('TestAdapter');
    });
});
