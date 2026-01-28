import { DecisionPolicy, Evolution } from './DecisionPolicy';
import { BaseValueObject } from './BaseValueObject';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

// Mock Logger and Tracer
jest.mock('./telemetry/Logger');
jest.mock('./telemetry/Tracer');

const mockCtx: RitaCtx = { traceId: 'test-trace-id' };

class TestEntity extends BaseValueObject<{ count: number; tag: string }> {
    protected validate() { }
}

class KitchenSinkPolicy extends DecisionPolicy<TestEntity, { mode: 'GT' | 'LT', val?: number }> {
    protected decide(target: TestEntity, context: { mode: 'GT' | 'LT', val?: number }): Evolution<TestEntity>[] {
        const threshold = context.val ?? 10;
        const result: Evolution<TestEntity>[] = [];

        if (context.mode === 'GT') {
            // Access _data directly or assume getter. For test we cast.
            if ((target._data.count) > threshold) {
                result.push({
                    changes: { tag: 'MATCHED_GT' },
                    note: "Count is GT " + threshold
                });
            }
        } else if (context.mode === 'LT') {
            if ((target._data.count) < threshold) {
                result.push({
                    changes: { tag: 'MATCHED_LT' },
                    note: "Count is LT " + threshold
                });
            }
        }
        return result;
    }
}

class ErrorPolicy extends DecisionPolicy<TestEntity, void> {
    protected decide(): Evolution<TestEntity>[] {
        throw new Error("Logic Explosion");
    }
}

describe('DecisionPolicy (Imperative)', () => {
    let mockSpan: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSpan = {
            end: jest.fn(),
            recordException: jest.fn()
        };
        (Tracer.startSpan as jest.Mock).mockReturnValue(mockSpan);
    });

    it('should apply evolutions when logic matches (GT)', () => {
        const policy = new KitchenSinkPolicy();
        const entity = new TestEntity({ count: 11, tag: 'neutral' });
        const result = policy.execute(mockCtx, entity, { mode: 'GT' });

        expect(result._data.tag).toBe('MATCHED_GT');

        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('Proposing Evolution'),
            expect.objectContaining({ reason: 'Count is GT 10' })
        );
        expect(Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('Execution Complete')
        );
    });

    it('should apply evolutions when logic matches (LT)', () => {
        const policy = new KitchenSinkPolicy();
        const entity = new TestEntity({ count: 5, tag: 'neutral' });
        const result = policy.execute(mockCtx, entity, { mode: 'LT' });

        expect(result._data.tag).toBe('MATCHED_LT');
    });

    it('should return identity when logic does not match', () => {
        const policy = new KitchenSinkPolicy();
        const entity = new TestEntity({ count: 5, tag: 'neutral' });
        // 5 is not GT 10
        const result = policy.execute(mockCtx, entity, { mode: 'GT' });

        expect(result).toBe(entity); // Referential equality
        expect(Logger.debug).toHaveBeenCalledWith(
            expect.stringContaining('No Evolutions Decided')
        );
    });

    it('should catch errors thrown in decide()', () => {
        const policy = new ErrorPolicy();
        const entity = new TestEntity({ count: 10, tag: 'n' });

        expect(() => policy.execute(mockCtx, entity)).toThrow("Logic Explosion");

        expect(mockSpan.recordException).toHaveBeenCalled();
        expect(mockSpan.end).toHaveBeenCalled();
    });
});
