import { BaseComponent } from './BaseComponent';
import { Logger } from './telemetry/Logger';
import { Tracer } from './telemetry/Tracer';
import { RitaCtx } from './RitaCtx';

// Mocks
jest.mock('./telemetry/Logger');
jest.mock('./telemetry/Tracer');

const mockCtx: RitaCtx = { traceId: 'test-trace-id' };

class TestComponent extends BaseComponent<{ value: string }, { result: string }> {
    protected async _run(ctx: RitaCtx, input: { value: string }): Promise<{ result: string }> {
        if (input.value === 'crash') {
            throw new Error('Boom');
        }
        return { result: 'processed ' + input.value };
    }
}

describe('BaseComponent', () => {
    let component: TestComponent;
    let mockSpan: any;

    beforeEach(() => {
        jest.clearAllMocks();
        component = new TestComponent();

        // Mock the Span object returned by Tracer
        mockSpan = {
            traceId: 'test-trace-id',
            end: jest.fn(),
            recordException: jest.fn()
        };
        (Tracer.startSpan as jest.Mock).mockReturnValue(mockSpan);
    });

    it('should execute successfully and log lifecycle events', async () => {
        const input = { value: 'hello' };
        const result = await component.execute(mockCtx, input);

        expect(result).toEqual({ result: 'processed hello' });

        // Verify Tracing
        expect(Tracer.startSpan).toHaveBeenCalledWith('TestComponent', mockCtx);
        expect(mockSpan.end).toHaveBeenCalled();

        // Verify Logging
        expect(Logger.info).toHaveBeenCalledWith(
            '[TestComponent] Started',
            expect.objectContaining({ traceId: 'test-trace-id', input })
        );
        expect(Logger.info).toHaveBeenCalledWith(
            '[TestComponent] Completed',
            expect.objectContaining({ traceId: 'test-trace-id' })
        );
    });

    it('should handle errors gracefully', async () => {
        const input = { value: 'crash' };

        await expect(component.execute(mockCtx, input)).rejects.toThrow('Boom');

        // Verify Tracing
        expect(mockSpan.recordException).toHaveBeenCalledWith(expect.any(Error));
        expect(mockSpan.end).toHaveBeenCalled();

        // Verify Logging
        expect(Logger.error).toHaveBeenCalledWith(
            '[TestComponent] Failed',
            expect.objectContaining({ error: 'Boom' })
        );
    });
});

import { BaseCommand } from './cqrs/BaseCommand';
import { BaseQuery } from './cqrs/BaseQuery';
import { CommitScope } from './persistence/CommitScope';

class TestCommand extends BaseCommand<void, void> {
    protected async _run(ctx: RitaCtx, input: void): Promise<void> {
        await this.commit(ctx, async (scope) => {
            // Write something
        });
    }
}

class TestQuery extends BaseQuery<void, void> {
    protected async executeQueryParams(ctx: RitaCtx, input: void): Promise<void> {
        return;
    }
}

describe('CQRS Enforcement', () => {
    let mockCtx: RitaCtx;

    beforeEach(() => {
        mockCtx = { traceId: 'test-trace' };
    });

    it('Command should throw if ctx.commit is missing', async () => {
        const cmd = new TestCommand();
        // Execute without commit capability
        await expect(cmd.execute(mockCtx, undefined)).rejects.toThrow('Cmd: Missing Commit Capability');
    });

    it('Command should succeed if ctx.commit is present', async () => {
        const cmd = new TestCommand();
        const commitSpy = jest.fn(async (fn) => fn({ _isCommitScope: true }));
        const ctxWithCommit = { ...mockCtx, commit: commitSpy };

        await cmd.execute(ctxWithCommit, undefined);
        expect(commitSpy).toHaveBeenCalled();
    });

    it('Query should execute without commit capability', async () => {
        const query = new TestQuery();
        await expect(query.execute(mockCtx, undefined)).resolves.not.toThrow();
    });
});



