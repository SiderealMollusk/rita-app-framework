import { ModuleRole, ROLE_DEFINITIONS } from '../RoleModel';

describe('RoleModel', () => {
    it('should have correct definitions for all roles', () => {
        expect(ROLE_DEFINITIONS[ModuleRole.PRIMARY_ADAPTER].role).toBe(ModuleRole.PRIMARY_ADAPTER);
        expect(ROLE_DEFINITIONS[ModuleRole.USE_CASE].role).toBe(ModuleRole.USE_CASE);
    });

    it('should have descriptions for all roles', () => {
        Object.values(ROLE_DEFINITIONS).forEach(def => {
            expect(def.description).toBeDefined();
            expect(def.description.length).toBeGreaterThan(0);
        });
    });
});
