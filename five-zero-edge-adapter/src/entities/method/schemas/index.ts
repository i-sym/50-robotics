import { z } from 'zod';

export const methodConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type MethodConfigData = z.infer<typeof methodConfigSchema>;

export const methodDescriptionSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.string(),
});

export type MethodDescriptionData = z.infer<typeof methodDescriptionSchema>;
