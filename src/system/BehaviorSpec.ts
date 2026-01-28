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

    // "When" and "Then" usually mapped to individual steps or assertions
    // in a real BDD framework, but here we map them to jest tests for simplicity
    // or just use them as comments/structure helpers.
}
