import { Tracer } from '../Tracer';
import { Logger } from '../Logger';
import { ContextFactory } from '../../context/promotion/ContextFactory';

describe('Telemetry', () => {
    describe('Tracer', () => {
        it('should start a span and allow ending it', () => {
            const ctx = ContextFactory.createExternal();
            const span = Tracer.startSpan('test', ctx);
            expect(span.traceId).toBe(ctx.traceId);
            expect(() => span.end()).not.toThrow();
            expect(() => span.recordException(new Error('test'))).not.toThrow();
        });
    });

    describe('Logger', () => {
        let logSpy: jest.SpyInstance;
        let errorSpy: jest.SpyInstance;
        let debugSpy: jest.SpyInstance;

        beforeEach(() => {
            logSpy = jest.spyOn(console, 'log').mockImplementation();
            errorSpy = jest.spyOn(console, 'error').mockImplementation();
            debugSpy = jest.spyOn(console, 'debug').mockImplementation();
        });

        afterEach(() => {
            logSpy.mockRestore();
            errorSpy.mockRestore();
            debugSpy.mockRestore();
            delete process.env.DEBUG;
        });

        it('should log info with and without meta', () => {
            Logger.info('test info', { key: 'val' });
            const entry = JSON.parse(logSpy.mock.calls[0][0]);
            expect(entry.level).toBe('INFO');
            expect(entry.message).toBe('test info');
            expect(entry.metadata.key).toBe('val');

            Logger.info('no meta');
            const entry2 = JSON.parse(logSpy.mock.calls[1][0]);
            expect(entry2.message).toBe('no meta');
        });

        it('should log error with and without meta', () => {
            Logger.error('test error');
            const entry = JSON.parse(errorSpy.mock.calls[0][0]);
            expect(entry.level).toBe('ERROR');
            expect(entry.message).toBe('test error');

            Logger.error('error with meta', { err: 'oops' });
            const entry2 = JSON.parse(errorSpy.mock.calls[1][0]);
            expect(entry2.metadata.err).toBe('oops');
        });

        it('should log debug when DEBUG env is set', () => {
            process.env.DEBUG = 'true';
            Logger.debug('test debug');
            const entry = JSON.parse(debugSpy.mock.calls[0][0]);
            expect(entry.level).toBe('DEBUG');
            expect(entry.message).toBe('test debug');

            Logger.debug('debug with meta', { d: 1 });
            const entry2 = JSON.parse(debugSpy.mock.calls[1][0]);
            expect(entry2.metadata.d).toBe(1);
        });

        it('should not log debug when DEBUG env is not set', () => {
            Logger.debug('test debug');
            expect(debugSpy).not.toHaveBeenCalled();
        });
    });
});
