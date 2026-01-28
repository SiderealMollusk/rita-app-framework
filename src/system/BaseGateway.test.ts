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
}

describe('BaseGateway', () => {
    let gateway: TestGateway;
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
    });
});
