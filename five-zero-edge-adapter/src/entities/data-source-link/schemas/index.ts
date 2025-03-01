import { z } from 'zod';

export const dataSourceLinkConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type DataSourceLinkConfigData = z.infer<typeof dataSourceLinkConfigSchema>;

export const dataSourceLinkDescriptionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type DataSourceLinkDescriptionData = z.infer<typeof dataSourceLinkDescriptionSchema>;
