import { Schema } from '../Schema';

describe('Schema facade', () => {
    it('should expose zod functionality', () => {
        const userSchema = Schema.object({
            id: Schema.string(),
            age: Schema.number()
        });

        const valid = userSchema.parse({ id: '1', age: 25 });
        expect(valid.id).toBe('1');
        expect(() => userSchema.parse({ id: '1', age: '25' })).toThrow();
    });
});
