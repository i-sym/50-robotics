import { z } from 'zod';

export const twinComponentDescriptionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type TwinComponentDescriptionData = z.infer<typeof twinComponentDescriptionSchema>;


export const twinComponentConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type TwinComponentConfigData = z.infer<typeof twinComponentConfigSchema>;
