import { StrictValueObject } from '../StrictValueObject';
import { isStrict } from '../types';


// Concrete Implementation
class Money extends StrictValueObject<{ amount: number; currency: string }> {
    constructor(amount: number, currency: string) {
        super({ amount, currency });
    }

    protected validate(data: { amount: number; currency: string; }): void {
        if (data.amount < 0) throw new Error("Negative money");
    }

    public static create(amount: number) {
        return new Money(amount, 'USD');
    }
}


describe('StrictValueObject', () => {
    it('should construct correctly', () => {
        const m = Money.create(100);
        expect(m._data).toEqual({ amount: 100, currency: 'USD' });
        expect(m._strictVersion).toBe(1);
    });

    it('should pass isStrict type guard', () => {
        const m = Money.create(100);
        expect(isStrict(m)).toBe(true);
        expect(isStrict({})).toBe(false);
        expect(isStrict(null)).toBe(false);
    });
});


