import { ContextFactory, promoteExternalToInternal, promoteInternalToCommand, promoteToSystem } from '../promotion/ContextFactory';
import { TrustLevel } from '../BaseCtx';
import { CommitCap } from '../capabilities/CommitCap';
import { RawQueryCap } from '../capabilities/RawQueryCap';
import { AdminCap } from '../capabilities/AdminCap';

describe('Promotion Functions (via ContextFactory re-exports)', () => {
    it('promoteExternalToInternal should promote context', () => {
        const external = ContextFactory.createExternal();
        const internal = promoteExternalToInternal(external, 'test-user');
        expect(internal.trustLevel).toBe(TrustLevel.Internal);
        expect(internal.principal).toBe('test-user');
    });

    it('promoteInternalToCommand should promote context', () => {
        const external = ContextFactory.createExternal();
        const internal = promoteExternalToInternal(external);
        const command = promoteInternalToCommand(internal);
        expect(command.trustLevel).toBe(TrustLevel.Command);
        expect(command.capabilities.has(CommitCap)).toBe(true);
    });

    it('promoteToSystem should promote context', () => {
        const external = ContextFactory.createExternal();
        const internal = promoteExternalToInternal(external);
        const system = promoteToSystem(internal);
        expect(system.trustLevel).toBe(TrustLevel.System);
        expect(system.capabilities.has(CommitCap)).toBe(true);
        expect(system.capabilities.has(RawQueryCap)).toBe(true);
        expect(system.capabilities.has(AdminCap)).toBe(true);
    });
});
