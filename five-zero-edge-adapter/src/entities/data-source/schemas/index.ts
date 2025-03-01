import { z } from 'zod';

export const dataSourceSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type DataSourceData = z.infer<typeof dataSourceSchema>;


export const dataSourceConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type DataSourceConfigData = z.infer<typeof dataSourceConfigSchema>;
