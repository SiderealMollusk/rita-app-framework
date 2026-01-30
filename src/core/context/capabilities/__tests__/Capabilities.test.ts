import { CommitCap } from '../CommitCap';
import { AdminCap } from '../AdminCap';
import { RawQueryCap } from '../RawQueryCap';

describe('Capabilities', () => {
    it('should create internal CommitCap (deprecated)', () => {
        const cap = CommitCap.createInternal();
        expect(CommitCap.isAuthorized(cap)).toBe(true);
    });

    it('should create internal AdminCap (deprecated)', () => {
        const cap = AdminCap.createInternal();
        expect(AdminCap.isAuthorized(cap)).toBe(true);
    });

    it('should create internal RawQueryCap (deprecated)', () => {
        const cap = RawQueryCap.createInternal();
        expect(RawQueryCap.isAuthorized(cap)).toBe(true);
    });
});
