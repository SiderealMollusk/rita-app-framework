import { Hexagon } from './Hexagon';
import { BehaviorSpec } from './BehaviorSpec';

describe('Hexagon', () => {
    it('should freeze the config', () => {
        const hexagon = Hexagon.define({
            name: 'TestHexagon',
            primaryAdapter: () => { },
            application: () => { },
            ports: () => { },
            secondaryAdapters: []
        });


        expect(Object.isFrozen(hexagon)).toBe(true);
    });

    it('should require a name', () => {
        expect(() => Hexagon.define({ name: '', interactions: [], useCases: [], gateways: [], policies: [] } as any))
            .toThrow('Hexagon must have a name');
    });
});

// Since BehaviorSpec wraps generic Jest functions (describe/test) that are globally defined,
// we can't easily unit test it without complex mocking of the global 'describe'/'test'.
// We trust the structural implementation for now as it's just a passthrough.
