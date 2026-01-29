import { Tracer, Span } from './Tracer';
import { Logger } from './Logger';
import { SystemClock } from '../Clock';

// Mock the Logger to avoid polluting console and to verify Tracer calls it
jest.mock('./Logger');

describe('Tracer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should start a span via static method', () => {
        const span = Tracer.startSpan('StaticSpan');
        expect(span).toBeInstanceOf(Span);
        expect(span.name).toBe('StaticSpan');
    });

    it('should start a span with a new traceId', () => {

        const span = Tracer.startSpan('test-span');

        expect(span.name).toBe('test-span');
        expect(span.traceId).toBeDefined();
        expect(span.spanId).toBeDefined();
        expect(span.startTime).toBeDefined();

        expect(Logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('[Span Started]'),
            expect.objectContaining({ traceId: span.traceId })
        );
    });

    it('should inherit parent traceId', () => {
        const parentTraceId = 'parent-123';
        const span = Tracer.startSpan('child-span', { traceId: parentTraceId });

        expect(span.traceId).toBe(parentTraceId);
    });

    it('should log duration when ending a span', () => {
        const span = Tracer.startSpan('duration-test');

        const start = SystemClock.now().getTime();
        while (SystemClock.now().getTime() - start < 2) {
            // Busy wait
        }



        span.end();

        expect(Logger.debug).toHaveBeenCalledTimes(2); // Start + End

        const endCall = (Logger.debug as jest.Mock).mock.calls[1];
        expect(endCall[0]).toContain('[Span Ended]');
        expect(endCall[1]).toHaveProperty('durationMs');
    });

    it('should record exceptions', () => {
        const span = Tracer.startSpan('error-span');
        const error = new Error('Something went wrong');

        span.recordException(error);

        expect(Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('[Span Exception]'),
            expect.objectContaining({
                error: 'Something went wrong',
                traceId: span.traceId
            })
        );
    });
});
