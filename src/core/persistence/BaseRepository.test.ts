import { BaseRepository } from './BaseRepository';
import { CommitScope } from './CommitScope';



// --- Mocks ---

// eslint-disable-next-line @typescript-eslint/no-explicit-any
class TestRepo extends BaseRepository<any> {

    public writeCalled = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public argsPassed: any[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected async _write(_scope: CommitScope, id: string, data: any, _expectedVersion?: number): Promise<void> {
        this.writeCalled = true;
        this.argsPassed = [_scope, id, data, _expectedVersion];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected getId(entity: any): string {

        return entity.id;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    protected getVersion(entity: any): number | undefined {
        return entity.version;
    }

}

// --- Tests ---

describe('BaseRepository', () => {
    let repo: TestRepo;

    beforeEach(() => {
        repo = new TestRepo();
    });

    it('should delegate to _write with correct arguments', async () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockScope = { isCommitScope: true } as any;

        const entity = { id: '123', version: 1, data: 'test' };

        await repo.saveIfChanged(mockScope, undefined, entity);

        expect(repo.writeCalled).toBe(true);
        expect(repo.argsPassed[0]).toBe(mockScope);
        expect(repo.argsPassed[1]).toBe('123'); // ID
        expect(repo.argsPassed[2]).toBe(entity); // Data
        expect(repo.argsPassed[3]).toBe(1); // Version
    });
});

