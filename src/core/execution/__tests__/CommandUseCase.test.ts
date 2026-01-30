import { CommandUseCase } from '../CommandUseCase';
import { BaseComponent } from '../BaseComponent';
import { UnitOfWorkPort } from '../../ports/UnitOfWorkPort';
import { UnitOfWork } from '../../ports/UnitOfWorkPort';

class ThrowingComponent extends BaseComponent<any, any> {
    public async _run(input: any) {
        throw new Error("Boom");
    }
}

class TestCommandUseCase extends CommandUseCase<any, any> {
    constructor(uowPort: UnitOfWorkPort) {
        super(uowPort);
    }
    public async run(input: any) {
        return this.executeCommand(new ThrowingComponent(), input);
    }
}


describe('CommandUseCase', () => {
    let mockUoW: UnitOfWork;
    let mockUoWPort: UnitOfWorkPort;

    beforeEach(() => {
        mockUoW = {
            commit: jest.fn(),
            rollback: jest.fn(),
            close: jest.fn()
        } as any;

        mockUoWPort = {
            start: jest.fn().mockResolvedValue(mockUoW)
        } as any;
    });

    it('should rollback transaction on error', async () => {
        const useCase = new TestCommandUseCase(mockUoWPort);

        await expect(useCase.run({})).rejects.toThrow("Boom");

        expect(mockUoWPort.start).toHaveBeenCalled();
        expect(mockUoW.rollback).toHaveBeenCalled();
        expect(mockUoW.close).toHaveBeenCalled();
        expect(mockUoW.commit).not.toHaveBeenCalled();
    });

    it('should handle error without UoW', async () => {
        const useCase = new TestCommandUseCase(undefined as any);
        await expect(useCase.run({})).rejects.toThrow("Boom");
        // Implicitly checks that code doesn't crash on undefined uow
    });
});
