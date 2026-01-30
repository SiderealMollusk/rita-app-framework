import { HarnessFactory } from '../HarnessFactory';

describe('HarnessFactory', () => {
    it('should create L1 with default seed', () => {
        const world = HarnessFactory.createL1();
        expect(world).toBeDefined();
    });
    it('should create L1 with custom seed', () => {
        const world = HarnessFactory.createL1(123);
        expect(world).toBeDefined();
    });

    it('should create L2 with default seed', () => {
        const world = HarnessFactory.createL2();
        expect(world).toBeDefined();
    });
    it('should create L2 with custom seed', () => {
        const world = HarnessFactory.createL2(123);
        expect(world).toBeDefined();
    });

    it('should create L3 with default seed', () => {
        const world = HarnessFactory.createL3();
        expect(world).toBeDefined();
    });
    it('should create L3 with custom seed', () => {
        const world = HarnessFactory.createL3(123);
        expect(world).toBeDefined();
    });

    it('should create L4 with default seed', () => {
        const world = HarnessFactory.createL4();
        expect(world).toBeDefined();
    });
    it('should create L4 with custom seed', () => {
        const world = HarnessFactory.createL4(123);
        expect(world).toBeDefined();
    });

    it('should create L5 with default seed', () => {
        const world = HarnessFactory.createL5();
        expect(world).toBeDefined();
    });
    it('should create L5 with custom seed', () => {
        const world = HarnessFactory.createL5(123);
        expect(world).toBeDefined();
    });
});
