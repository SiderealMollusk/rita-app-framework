import { ClockPort } from '../ports/ClockPort';

/**
 * The standard clock implementation for the framework.
 */
export class RitaClock implements ClockPort {
    private static instance: ClockPort = new RitaClock();

    public now(): Date {
        return new Date();
    }

    /**
     * Internal framework access to the current time.
     */
    public static now(): Date {
        return this.instance.now();
    }

    /**
     * Allows overriding the clock for testing purposes.
     */
    public static _setTestClock(clock: ClockPort): void {
        this.instance = clock;
    }

    /**
     * Resets the clock to the default implementation.
     */
    public static _reset(): void {
        this.instance = new RitaClock();
    }
}
