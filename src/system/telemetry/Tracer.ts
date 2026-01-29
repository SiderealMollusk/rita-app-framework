import { Logger } from './Logger';
import { v4 as uuidv4 } from 'uuid'; // We need a UUID generator. I will need to install this.
import { RitaClock } from '../Clock';

/**
 * A simulation of a Distributed Tracing Span.
 * In production, this would wrap OpenTelemetry's Span.
 */
export class Span {
    readonly traceId: string;
    readonly spanId: string;
    readonly name: string;
    readonly startTime: number;

    constructor(name: string, traceId?: string) {
        this.name = name;
        this.traceId = traceId || uuidv4();
        this.spanId = uuidv4();
        this.startTime = RitaClock.now().getTime();
        Logger.debug(`[Span Started] ${this.name}`, { traceId: this.traceId, spanId: this.spanId });
    }

    end() {
        const duration = RitaClock.now().getTime() - this.startTime;

        Logger.debug(`[Span Ended] ${this.name}`, {
            traceId: this.traceId,
            spanId: this.spanId,
            durationMs: duration
        });
    }

    recordException(err: Error) {
        Logger.error(`[Span Exception] ${this.name}`, {
            traceId: this.traceId,
            spanId: this.spanId,
            error: err.message,
            stack: err.stack
        });
    }
}

export class Tracer {
    static startSpan(name: string, ctx?: { traceId: string }): Span {
        return new Span(name, ctx?.traceId);
    }
}
