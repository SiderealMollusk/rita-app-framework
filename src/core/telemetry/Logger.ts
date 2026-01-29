import { RitaClock } from '../domain/RitaClock';

export class Logger {
    private static format(level: string, message: string, meta?: any): string {
        const entry: any = {
            timestamp: RitaClock.now().toISOString(),
            level,
            message,
            traceId: meta?.traceId,
            spanId: meta?.spanId,
            component: meta?.component,
            metadata: { ...meta }
        };

        // If evolution or snapshot are in meta, promote them to top level as per spec
        if (meta?.evolution) {
            entry.evolution = meta.evolution;
            delete entry.metadata.evolution;
        }
        if (meta?.snapshot) {
            entry.snapshot = meta.snapshot;
            delete entry.metadata.snapshot;
        }

        // Clean up redundant fields in metadata
        delete entry.metadata.traceId;
        delete entry.metadata.spanId;
        delete entry.metadata.component;

        return JSON.stringify(entry);
    }

    static info(message: string, meta?: any): void {
        console.log(this.format('INFO', message, meta));
    }
    static error(message: string, meta?: any): void {
        console.error(this.format('ERROR', message, meta));
    }
    static debug(message: string, meta?: any): void {
        if (process.env.DEBUG) {
            console.debug(this.format('DEBUG', message, meta));
        }
    }
}
