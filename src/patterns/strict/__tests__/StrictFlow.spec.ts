import { z } from 'zod';
import { StrictEntity } from '../StrictEntity';
import { StrictPolicy } from '../StrictPolicy';
import { StrictUseCase } from '../StrictUseCase';
import { OperationScope } from '../../../core/scope/OperationScope';
import { ContextFactory } from '../../../core/context/promotion/ContextFactory';
import { Evolution } from '../../../core/domain/DecisionPolicy';
import { UnauthorizedError } from '../../../core/errors/UnauthorizedError';
import { PolicyToken } from '../../../core/domain/PolicyToken';

// 1. Define a Strict Entity
interface UserData {
    name: string;
    age: number;
}

class UserEntity extends StrictEntity<UserData> {
    protected validate(data: UserData): void {
        if (data.age < 0) throw new Error("Age cannot be negative");
    }

    // Exposed for testing within policy
    static create(token: PolicyToken, id: string, data: UserData): UserEntity {
        return this.createInstance(token, id, data);
    }

    // Business logic
    updateName(token: PolicyToken, newName: string) {
        return this._evolve({ name: newName }, "Name update", token);
    }
}

// 2. Define a Strict Policy
class RenameUserPolicy extends StrictPolicy<UserEntity, { newName: string }> {
    protected decide(target: UserEntity, context: { newName: string }): Evolution<UserEntity>[] {
        return [{
            changes: { name: context.newName },
            note: `Renamed to ${context.newName}`
        }];
    }
}

// 3. Define a Strict Use Case
const RenameRequestSchema = z.object({
    id: z.string(),
    newName: z.string().min(3)
});

const RenameResponseSchema = z.object({
    success: z.boolean()
});

class RenameUserUseCase extends StrictUseCase<z.infer<typeof RenameRequestSchema>, z.infer<typeof RenameResponseSchema>> {
    protected get requestSchema() { return RenameRequestSchema; }
    protected get responseSchema() { return RenameResponseSchema; }

    protected async onExecute(scope: OperationScope, input: { id: string, newName: string }) {
        // Mock load
        const policy = new RenameUserPolicy();
        // We can't create entity without token, so we use scope.authorize
        const user = scope.authorize(policy, (token) =>
            UserEntity.create(token, input.id, { name: "Old Name", age: 25 })
        );

        const updatedUser = policy.run(scope, user, { newName: input.newName });

        return { success: updatedUser._data.name === input.newName };
    }
}

describe('Strict Architecture Pattern', () => {
    let scope: OperationScope;

    beforeEach(() => {
        const internal = ContextFactory.createSystem();
        scope = OperationScope.create(internal);
    });

    it('should reject creating a StrictEntity without a valid PolicyToken', () => {
        expect(() => {
            // @ts-ignore - reaching into protected for testing
            UserEntity.createInstance({} as any, "1", { name: "Test", age: 20 });
        }).toThrow(UnauthorizedError);
    });

    it('should allow creating a StrictEntity within scope.authorize', () => {
        const policy = new RenameUserPolicy();
        const user = scope.authorize(policy, (token) =>
            UserEntity.create(token, "1", { name: "Test", age: 20 })
        );
        expect(user.id).toBe("1");
        expect(user._data.name).toBe("Test");
    });

    it('should enforce Zod validation in StrictUseCase', async () => {
        const useCase = new RenameUserUseCase();

        // Invalid input (name too short)
        await expect(useCase.run(scope, { id: "1", newName: "Ab" }))
            .rejects.toThrow();

        // Valid input
        const result = await useCase.run(scope, { id: "1", newName: "Alice" });
        expect(result.success).toBe(true);
    });

    it('should enforce that evolved entities still match the Strict pattern', () => {
        const policy = new RenameUserPolicy();
        const user = scope.authorize(policy, (token) =>
            UserEntity.create(token, "1", { name: "Test", age: 20 })
        );

        const updatedUser = policy.run(scope, user, { newName: "Bob" });
        expect(updatedUser._strictVersion).toBe(1);
        expect(updatedUser._data.name).toBe("Bob");
        expect(updatedUser._rev).toBe(2);
    });
});
