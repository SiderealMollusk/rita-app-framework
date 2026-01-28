import { Logger, LogLevel } from './Logger';

describe('Logger', () => {
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeEach(() => {
        logSpy = jest.spyOn(console, 'log').mockImplementation();
        errorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        logSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('should log info messages to console.log', () => {
        Logger.info('test message', { foo: 'bar' });

        expect(logSpy).toHaveBeenCalled();
        const callArgs = JSON.parse(logSpy.mock.calls[0][0]);

        expect(callArgs.level).toBe(LogLevel.INFO);
        expect(callArgs.msg).toBe('test message');
        expect(callArgs.foo).toBe('bar');
        expect(callArgs.ts).toBeDefined();
    });

    it('should log error messages to console.error', () => {
        Logger.error('error message');

        expect(errorSpy).toHaveBeenCalled();
        const callArgs = JSON.parse(errorSpy.mock.calls[0][0]);

        expect(callArgs.level).toBe(LogLevel.ERROR);
        expect(callArgs.msg).toBe('error message');
    });
});
