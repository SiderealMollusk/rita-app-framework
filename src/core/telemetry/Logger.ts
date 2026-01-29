import { SystemClock } from '../Clock';



export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3
}

export type LogContext = Record<string, any>;

/**
 * Structured Logger Wrapper.
 * Enforces metadata consistent with the "Agent-First" philosophy.
 */
export class Logger {
    public static level: LogLevel = LogLevel.INFO;

    // In a real app, we'd inject a correlation ID provider here.
    // For now, we'll accept context objects.

    public static log(level: LogLevel, message: string, payload?: object) {
        if (level < Logger.level) return;

        const entry = {
            timestamp: SystemClock.now().toISOString(),
            level: LogLevel[level], // String representation
            message,
            ...payload
        };

        const output = JSON.stringify(entry);

        if (level >= LogLevel.ERROR) {
            console.error(output);
        } else {
            console.log(output);
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
