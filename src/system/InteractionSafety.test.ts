import { BaseInteraction, CommandInteraction, QueryInteraction } from './BaseInteraction';
import { BaseComponent } from './BaseComponent';

import { RitaCtx } from './RitaCtx';

// --- Mocks & Stubs --- //

class StubComponent extends BaseComponent<any, RitaCtx> {
    // Just return the context so we can inspect it
    protected async _run(ctx: RitaCtx, input: any): Promise<RitaCtx> {
        return ctx;
    }
}

// --- Future Subclasses (We define them here as if they existed) --- //

class MyQuery extends QueryInteraction<any, RitaCtx> {

    public async run(input: any): Promise<RitaCtx> {
        return this.executeUseCase(new StubComponent(), input);
    }
}

class MyCommand extends CommandInteraction<any, RitaCtx> {


    public async run(input: any): Promise<RitaCtx> {
        return this.executeUseCase(new StubComponent(), input);
    }
}

describe('Interaction Safety (TDD)', () => {

    it('should succeed for QueryInteraction (No Commit Scope)', async () => {
        const interaction = new MyQuery();
        const ctx: RitaCtx = await interaction.run({});

        expect(ctx.traceId).toBeDefined();
        expect(ctx.commit).toBeUndefined();
    });

    it('should succeed for CommandInteraction (Has Commit Scope)', async () => {
        const interaction = new MyCommand();
        const ctx: RitaCtx = await interaction.run({});

        expect(ctx.traceId).toBeDefined();
        expect(ctx.commit).toBeDefined();

        await ctx.commit!(async (scope: any) => {
            expect(scope).toBeDefined();
        });
    });

});
