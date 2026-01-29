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
            expect(logSpy).toHaveBeenCalledWith('[INFO] test info', { key: 'val' });
            Logger.info('no meta');
            expect(logSpy).toHaveBeenCalledWith('[INFO] no meta', '');
        });

        it('should log error with and without meta', () => {
            Logger.error('test error');
            expect(errorSpy).toHaveBeenCalledWith('[ERROR] test error', '');
            Logger.error('error with meta', { err: 'oops' });
            expect(errorSpy).toHaveBeenCalledWith('[ERROR] error with meta', { err: 'oops' });
        });

        it('should log debug when DEBUG env is set', () => {
            process.env.DEBUG = 'true';
            Logger.debug('test debug');
            expect(debugSpy).toHaveBeenCalledWith('[DEBUG] test debug', '');
            Logger.debug('debug with meta', { d: 1 });
            expect(debugSpy).toHaveBeenCalledWith('[DEBUG] debug with meta', { d: 1 });
        });

        it('should not log debug when DEBUG env is not set', () => {
            Logger.debug('test debug');
            expect(debugSpy).not.toHaveBeenCalled();
        });
    });
});
