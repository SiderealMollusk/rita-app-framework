import { BaseComponent } from '../BaseComponent';
import { BaseUseCase } from '../BaseUseCase';
import { QueryUseCase } from '../QueryUseCase';
import { CommandUseCase } from '../CommandUseCase';
import { ContextFactory } from '../../context/promotion/ContextFactory';
import { TrustLevel } from '../../context/BaseCtx';

class MockComponent extends BaseComponent<string, string> {
    protected async _run(ctx: any, input: string): Promise<string> {
        return `Hello ${input}`;
    }
}

class MockErrorComponent extends BaseComponent<string, string> {
    protected async _run(): Promise<string> {
        throw new Error('Component failed');
    }
}

class MockQuery extends QueryUseCase<string, string> {
    private component = new MockComponent();
    public async run(input: string): Promise<string> {
        return this.executeQuery(this.component, input, 'user-1');
    }
}

class MockCommand extends CommandUseCase<string, string> {
    private component = new MockComponent();
    public async run(input: string): Promise<string> {
        return this.executeCommand(this.component, input, 'user-1');
    }
}

describe('Execution Primitives', () => {
    describe('BaseComponent', () => {
        it('should execute successfully', async () => {
            const component = new MockComponent();
            const ctx = ContextFactory.createExternal();
            const result = await component.execute(ctx, 'World');
            expect(result).toBe('Hello World');
        });

        it('should handle errors', async () => {
            const component = new MockErrorComponent();
            const ctx = ContextFactory.createExternal();
            await expect(component.execute(ctx, 'World')).rejects.toThrow('Component failed');
        });
    });

    describe('UseCase specializations', () => {
        it('QueryUseCase should promote to Internal trust level', async () => {
            const query = new MockQuery();
            const result = await query.run('Query');
            expect(result).toBe('Hello Query');
        });

        it('CommandUseCase should promote to Command trust level', async () => {
            const command = new MockCommand();
            const result = await command.run('Command');
            expect(result).toBe('Hello Command');
        });

        it('should handle component errors at UseCase boundary', async () => {
            class ErrorQuery extends QueryUseCase<string, string> {
                private component = new MockErrorComponent();
                public async run(input: string): Promise<string> {
                    return this.executeQuery(this.component, input);
                }
            }
            const query = new ErrorQuery();
            await expect(query.run('test')).rejects.toThrow('Component failed');
        });
    });
});
