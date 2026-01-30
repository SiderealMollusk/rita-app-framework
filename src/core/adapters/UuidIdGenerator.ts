import { IdGeneratorPort } from '../ports/IdGeneratorPort';
import { v4 as uuidv4 } from 'uuid';

export class UuidIdGenerator implements IdGeneratorPort {
    generate(prefix?: string): string {
        const id = uuidv4();
        return prefix ? `${prefix}-${id}` : id;
    }
}
