import { CommandUseCase } from './BaseUseCase';
import { BaseComponent } from './BaseComponent';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { SystemCtx } from './SystemCtx';

// Mocks
jest.mock('./telemetry/Logger');
jest.mock('./telemetry/Tracer');

// Mock Use Case
class TestUseCase extends BaseComponent<string, string> {
    protected async _run(ctx: SystemCtx, input: string): Promise<string> {
        if (input === 'fail') throw new Error('UseCase Boom');
        return `Prepared: ${input}`;
    }
}

// Concrete Interaction
class TestController extends CommandUseCase<string, string> {

    private useCase = new TestUseCase();

    public async run(input: string): Promise<string> {
        return this.executeUseCase(this.useCase, input);
    }
}


describe('BaseUseCase', () => {
    let controller: TestController;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSpan: any;


    beforeEach(() => {
        jest.clearAllMocks();
        controller = new TestController();
        mockSpan = { traceId: 'interaction-trace', end: jest.fn(), recordException: jest.fn() };


        (Tracer.startSpan as jest.Mock).mockReturnValue(mockSpan);

    });

    it('should delegate to Use Case and trace execution', async () => {
        const result = await controller.run('hello');

        expect(result).toBe('Prepared: hello');

        // Verify tracing chain
        expect(Tracer.startSpan).toHaveBeenCalledWith(expect.stringContaining('[UseCase] TestController'), expect.any(Object));
        expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should catch and log Use Case errors', async () => {
        await expect(controller.run('fail')).rejects.toThrow('UseCase Boom');

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[UseCase] TestController failed'),
            expect.any(Object)
        );


    });
});
