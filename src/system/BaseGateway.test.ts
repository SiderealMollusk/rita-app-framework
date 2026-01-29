import { BaseGateway } from './BaseGateway';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

jest.mock('./telemetry/Logger');
jest.mock('./telemetry/Tracer');

class TestGateway extends BaseGateway {
    public async fetchData(ctx: RitaCtx, shouldFail: boolean): Promise<string> {
        return this.safeExecute(ctx, 'fetchData', async () => {
            if (shouldFail) throw new Error('Network Error');
            return 'Success';
        });
    }

    public async testSafeExecute<T>(ctx: RitaCtx, op: string, fn: () => Promise<T>): Promise<T> {
        return this.safeExecute(ctx, op, fn);
    }
}


describe('BaseGateway', () => {
    let gateway: TestGateway;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mockSpan: any;


    beforeEach(() => {
        jest.clearAllMocks();
        gateway = new TestGateway();
        mockSpan = { traceId: 'gateway-trace', end: jest.fn(), recordException: jest.fn() };


        (Tracer.startSpan as jest.Mock).mockReturnValue(mockSpan);

    });

    it('should execute successfully and trace', async () => {
        const result = await gateway.fetchData({ traceId: 'test-trace' }, false);

        expect(result).toBe('Success');
        expect(Tracer.startSpan).toHaveBeenCalledWith(expect.stringContaining('[Gateway] TestGateway:fetchData'), expect.anything());
        expect(Logger.debug).toHaveBeenCalledWith(expect.stringContaining('succeeded'), expect.any(Object));
        expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should catch errors and record exceptions', async () => {
        await expect(gateway.fetchData({ traceId: 'test-trace' }, true)).rejects.toThrow('Network Error');


        expect(Logger.error).toHaveBeenCalledWith(expect.stringContaining('FAILED'), expect.any(Object));


        expect(mockSpan.recordException).toHaveBeenCalled();

        expect(mockSpan.end).toHaveBeenCalled();
        expect(mockSpan.end).toHaveBeenCalled();
    });

    it('should catch non-Error objects and record them safely', async () => {
        // Mock safeExecute logic if needed, or subclass modification.
        // Actually, we can just throw a string from the callback block.
        const promise = gateway.testSafeExecute({ traceId: 't1' }, 'failOp', async () => {
            throw "String Error";
        });

        await expect(promise).rejects.toBe("String Error");

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('FAILED'),
            expect.objectContaining({ error: "String Error" })
        );
        expect(mockSpan.recordException).toHaveBeenCalledWith(expect.any(Error));
        const recordedError = mockSpan.recordException.mock.calls[0][0];
        expect(recordedError).toBeInstanceOf(Error);
        expect(recordedError.message).toBe("String Error");
    });


});
