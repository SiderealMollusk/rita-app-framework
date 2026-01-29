import { Hexagon } from './Hexagon';

describe('Hexagon', () => {
    it('should freeze the config', () => {
        class Primary { }
        class App { }
        class Port { }

        const hexagon = Hexagon.define({
            name: 'TestHexagon',
            primaryAdapter: Primary,
            application: App,
            ports: Port,
            secondaryAdapters: []
        });


        expect(Object.isFrozen(hexagon)).toBe(true);
    });


    it('should require a name', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect(() => Hexagon.define({ name: '', interactions: [], useCases: [], gateways: [], policies: [] } as any))
            .toThrow('Hexagon must have a name');
    });

});

// Since BehaviorSpec wraps generic Jest functions (describe/test) that are globally defined,
// we can't easily unit test it without complex mocking of the global 'describe'/'test'.
// We trust the structural implementation for now as it's just a passthrough.
