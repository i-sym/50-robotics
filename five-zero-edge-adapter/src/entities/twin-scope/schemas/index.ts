import { z } from 'zod';

export const twinScopeConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type TwinScopeConfigData = z.infer<typeof twinScopeConfigSchema>;


export const twinScopeDescriptionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type TwinScopeDescriptionData = z.infer<typeof twinScopeDescriptionSchema>;
