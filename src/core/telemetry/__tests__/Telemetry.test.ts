import { Logger } from '../Logger';
import { Tracer } from '../Tracer';
import { ContextFactory } from '../../context/promotion/ContextFactory';

describe('Telemetry', () => {
    it('should log without crashing', () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation();
        const errorSpy = jest.spyOn(console, 'error').mockImplementation();
        const debugSpy = jest.spyOn(console, 'debug').mockImplementation();

        Logger.info('info');
        Logger.error('error');

        process.env.DEBUG = 'true';
        Logger.debug('debug enabled');

        delete process.env.DEBUG;
        Logger.debug('debug disabled');

        expect(logSpy).toHaveBeenCalled();
        expect(errorSpy).toHaveBeenCalled();
        expect(debugSpy).toHaveBeenCalled();

        logSpy.mockRestore();
        errorSpy.mockRestore();
        debugSpy.mockRestore();
    });

    it('should create spans', () => {
        const ctx = ContextFactory.createExternal();
        const span = Tracer.startSpan('test', ctx);
        expect(span.traceId).toBe(ctx.traceId);
        span.recordException(new Error('fail'));
        span.end();
    });
});
