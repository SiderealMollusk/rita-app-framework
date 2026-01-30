import { InMemoryUnitOfWorkFactory } from '../UnitOfWork'; // Assuming export in UnitOfWork.ts
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { CommitCap } from '../../context/capabilities/CommitCap';
import { CapabilityBag } from '../../context/CapabilityBag';

describe('InMemoryUnitOfWorkFactory', () => {
    let factory: InMemoryUnitOfWorkFactory;

    beforeEach(() => {
        factory = new InMemoryUnitOfWorkFactory();
    });

    it('should open a UoW for a valid CommandCtx', async () => {
        const ext = ContextFactory.createExternal();
        const int = ContextFactory.promoteToInternal(ext, 'system');
        const commandCtx = ContextFactory.promoteToCommand(int);

        const uow = await factory.open(commandCtx);
        expect(uow).toBeDefined();
        await uow.close();
    });

    it('should throw if context lacks CommitCap', async () => {
        const ext = ContextFactory.createExternal();
        const int = ContextFactory.promoteToInternal(ext, 'user');
        // Mock CommandCtx without CommitCap
        const fakeCommand = {
            ...int,
            trustLevel: 99,
            capabilities: new CapabilityBag() // Empty
        } as any;

        await expect(factory.open(fakeCommand)).rejects.toThrow(); // Capability error
    });

    it('should strictly forbid nested UoWs (Law 5)', async () => {
        const ext = ContextFactory.createExternal();
        const int = ContextFactory.promoteToInternal(ext, 'system');
        const commandCtx = ContextFactory.promoteToCommand(int);

        // 1. Open First
        const uow1 = await factory.open(commandCtx);

        // 2. Try Open Second (Same Trace)
        await expect(factory.open(commandCtx)).rejects.toThrow(/Nested UnitOfWork/);

        // 3. Close First
        await uow1.close();

        // 4. Open Third (Should work now)
        const uow2 = await factory.open(commandCtx);
        expect(uow2).toBeDefined();
        await uow2.close();
    });

    it('should support rollback of participants', async () => {
        const ext = ContextFactory.createExternal();
        const int = ContextFactory.promoteToInternal(ext, 'system');
        const commandCtx = ContextFactory.promoteToCommand(int);

        const uow = await factory.open(commandCtx) as any; // Cast to access 'registerParticipant'

        const mockParticipant = {
            commit: jest.fn(),
            rollback: jest.fn()
        };

        uow.registerParticipant(mockParticipant);

        await uow.rollback();
        expect(mockParticipant.rollback).toHaveBeenCalled();
        expect(mockParticipant.commit).not.toHaveBeenCalled();

        await uow.close();
    });

    it('should support commit of participants', async () => {
        const ext = ContextFactory.createExternal();
        const int = ContextFactory.promoteToInternal(ext, 'system');
        const commandCtx = ContextFactory.promoteToCommand(int);

        const uow = await factory.open(commandCtx) as any;

        const mockParticipant = {
            commit: jest.fn(),
            rollback: jest.fn()
        };

        uow.registerParticipant(mockParticipant);

        await uow.commit();
        expect(mockParticipant.commit).toHaveBeenCalled();
        await uow.close();
    });

});
