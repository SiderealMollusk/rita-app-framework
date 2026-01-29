/**
 * The Framework Schema Definer.
 * 
 * Currently backed by Zod.
 * This facade allows future migration to ArkType or others if performance demands it.
 */
import { z } from 'zod';

export const Schema = z;
export type SchemaType<T extends z.ZodTypeAny> = z.infer<T>;
export type ZodSchema = z.ZodTypeAny; // For internal usage type
