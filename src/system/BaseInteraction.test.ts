import { BaseInteraction } from './BaseInteraction';
import { BaseComponent } from './BaseComponent';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

// Mocks
jest.mock('./telemetry/Logger');
jest.mock('./telemetry/Tracer');

// Mock Use Case
class TestUseCase extends BaseComponent<string, string> {
    protected async _run(ctx: RitaCtx, input: string): Promise<string> {
        if (input === 'fail') throw new Error('UseCase Boom');
        return `Prepared: ${input}`;
    }
}

// Concrete Interaction
class TestController extends BaseInteraction<string, string> {
    private useCase = new TestUseCase();

    public async run(input: string): Promise<string> {
        return this.executeUseCase(this.useCase, input);
    }
}

describe('BaseInteraction', () => {
    let controller: TestController;
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
        expect(Tracer.startSpan).toHaveBeenCalledWith(expect.stringContaining('[Interaction] TestController'), expect.any(Object));
        expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should catch and log Use Case errors', async () => {
        await expect(controller.run('fail')).rejects.toThrow('UseCase Boom');

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[Interaction] TestController failed'),
            expect.any(Object)
        );
    });
});
