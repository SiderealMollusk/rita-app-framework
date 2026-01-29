import { Logger } from './telemetry/Logger';

/**
 * The "Behavior Driven" Test Wrapper.
 * 
 * Provides a standard structure for Feature Tests:
 * - Given (Context/State)
 * - When (Action/Interaction)
 * - Then (Assertion/Output)
 * 
 * This is just a semantic wrapper around Jest to enforce
 * readable test names.
 */
export class BehaviorSpec {

    static feature(name: string, fn: () => void) {
        describe(`FEATURE: ${name}`, fn);
    }

    static scenario(name: string, fn: () => void) {
        describe(`  SCENARIO: ${name}`, () => {
            beforeEach(() => {
                Logger.info(`[Scenario] ${name} START`);
            });
            fn();
        });
    }

    static given(text: string, fn: () => void | Promise<void>) {
        test(`    GIVEN ${text}`, fn as any);
    }

    static when(text: string, fn: () => void | Promise<void>) {
        test(`    WHEN ${text}`, fn as any);
    }

    static then(text: string, fn: () => void | Promise<void>) {
        test(`    THEN ${text}`, fn as any);
    }
}

