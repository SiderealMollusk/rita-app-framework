// Simple Value Object Context
export type CustomerProfile = {
    readonly userId: string;
    readonly tier: 'STD' | 'GOLD' | 'PLAT';
};
