/**
 * Defines the core terminology and roles within a Hexagon.
 */
export enum ModuleRole {
    PRIMARY_ADAPTER = 'PRIMARY_ADAPTER',
    SECONDARY_ADAPTER = 'SECONDARY_ADAPTER',
    USE_CASE = 'USE_CASE',
    DOMAIN_POLICY = 'DOMAIN_POLICY',
    REPOSITORY = 'REPOSITORY',
    PORT = 'PORT'
}

export interface RoleModel {
    role: ModuleRole;
    description: string;
}

export const ROLE_DEFINITIONS: Record<ModuleRole, RoleModel> = {
    [ModuleRole.PRIMARY_ADAPTER]: {
        role: ModuleRole.PRIMARY_ADAPTER,
        description: 'Inbound boundary: handles external requests (HTTP, CLI, Events).'
    },
    [ModuleRole.SECONDARY_ADAPTER]: {
        role: ModuleRole.SECONDARY_ADAPTER,
        description: 'Outbound boundary: handles external system interactions (APIs, Queues).'
    },
    [ModuleRole.USE_CASE]: {
        role: ModuleRole.USE_CASE,
        description: 'Application logic: orchestrates domain and side effects.'
    },
    [ModuleRole.DOMAIN_POLICY]: {
        role: ModuleRole.DOMAIN_POLICY,
        description: 'Pure domain logic: makes decisions based on state.'
    },
    [ModuleRole.REPOSITORY]: {
        role: ModuleRole.REPOSITORY,
        description: 'Persistence boundary: structured data access.'
    },
    [ModuleRole.PORT]: {
        role: ModuleRole.PORT,
        description: 'Interface contract: decouples layers.'
    }
};
