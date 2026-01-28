import * as util from 'util';

export enum LogLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error'
}

export type LogContext = Record<string, any>;

/**
 * Structured Logger Wrapper.
 * Enforces metadata consistent with the "Agent-First" philosophy.
 */
export class Logger {

    // In a real app, we'd inject a correlation ID provider here.
    // For now, we'll accept context objects.

    private static log(level: LogLevel, message: string, context?: LogContext) {
        const timestamp = new Date().toISOString();
        const payload = {
            ts: timestamp,
            level,
            msg: message,
            ...context
        };

        // We use console for now, but this is the "Plug" for OpenTelemetry later.
        const output = JSON.stringify(payload);

        switch (level) {
            case LogLevel.ERROR:
                console.error(output);
                break;
            case LogLevel.WARN:
                console.warn(output);
                break;
            case LogLevel.INFO:
            case LogLevel.DEBUG:
            default:
                console.log(output);
                break;
        }
    }

    static info(message: string, context?: LogContext) {
        this.log(LogLevel.INFO, message, context);
    }

    static warn(message: string, context?: LogContext) {
        this.log(LogLevel.WARN, message, context);
    }

    static error(message: string, context?: LogContext) {
        this.log(LogLevel.ERROR, message, context);
    }

    static debug(message: string, context?: LogContext) {
        this.log(LogLevel.DEBUG, message, context);
    }
}
