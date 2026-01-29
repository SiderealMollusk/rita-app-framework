import { ContextFactory } from '../promotion/ContextFactory';
import { TrustLevel } from '../BaseCtx';
import { CapabilityBag, Capability } from '../CapabilityBag';
import { CommitCap } from '../capabilities/CommitCap';
import { RawQueryCap } from '../capabilities/RawQueryCap';
import { AdminCap } from '../capabilities/AdminCap';

describe('Context & Capability System', () => {
    it('should create an external context with no capabilities', () => {
        const ctx = ContextFactory.createExternal();
        expect(ctx.trustLevel).toBe(TrustLevel.External);
        expect(ctx.traceId).toBeDefined();
        expect(ctx.capabilities.has(CommitCap)).toBe(false);
    });

    it('should promote external to internal', () => {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external, 'user-123');
        expect(internal.trustLevel).toBe(TrustLevel.Internal);
        expect(internal.traceId).toBe(external.traceId);
        expect(internal.principal).toBe('user-123');
    });

    it('should promote internal to command and add CommitCap', () => {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external);
        const command = ContextFactory.promoteToCommand(internal);

        expect(command.trustLevel).toBe(TrustLevel.Command);
        expect(command.capabilities.has(CommitCap)).toBe(true);
        expect(command.capabilities.has(RawQueryCap)).toBe(false);
    });

    it('should elevate internal to system and add all caps', () => {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external);
        const system = ContextFactory.elevateToSystem(internal);

        expect(system.trustLevel).toBe(TrustLevel.System);
        expect(system.capabilities.has(CommitCap)).toBe(true);
        expect(system.capabilities.has(RawQueryCap)).toBe(true);
        expect(system.capabilities.has(AdminCap)).toBe(true);
    });

    it('should throw when requiring a missing capability', () => {
        const ctx = ContextFactory.createExternal();
        expect(() => ctx.capabilities.require(CommitCap)).toThrow('Missing required capability: CommitCap');
    });

    it('should not allow forging capabilities', () => {
        // Even if someone bypasses the private constructor with 'any',
        // it shouldn't be authorized because it's not in the WeakSet
        const forged = new (CommitCap as any)();
        expect(CommitCap.isAuthorized(forged)).toBe(false);
        expect(RawQueryCap.isAuthorized(forged)).toBe(false);
        expect(AdminCap.isAuthorized(forged)).toBe(false);

        const bag = new CapabilityBag([forged]);
        expect(bag.has(CommitCap)).toBe(false);
        expect(() => bag.require(CommitCap)).toThrow('Missing required capability: CommitCap');
    });

    it('should return false for has when capability is missing', () => {
        const ctx = ContextFactory.createExternal();
        expect(ctx.capabilities.has(CommitCap)).toBe(false);
    });

    it('should handle unprotected capabilities (without isAuthorized)', () => {
        class UnprotectedCap extends Capability {
            // @ts-ignore
            protected readonly _capabilityKind = 'Unprotected';
        }
        const cap = new (UnprotectedCap as any)();
        const bag = new CapabilityBag([cap]);
        expect(bag.has(UnprotectedCap)).toBe(true);
        expect(bag.require(UnprotectedCap)).toBe(cap);
    });

    it('should handle multiple capabilities in the bag', () => {
        const external = ContextFactory.createExternal();
        const internal = ContextFactory.promoteToInternal(external);
        const system = ContextFactory.elevateToSystem(internal);

        expect(system.capabilities.has(CommitCap)).toBe(true);
        expect(system.capabilities.has(RawQueryCap)).toBe(true);
        expect(system.capabilities.has(AdminCap)).toBe(true);

        const commit = system.capabilities.require(CommitCap);
        expect(commit).toBeInstanceOf(CommitCap);

        const raw = system.capabilities.require(RawQueryCap);
        expect(raw).toBeInstanceOf(RawQueryCap);
    });
});
