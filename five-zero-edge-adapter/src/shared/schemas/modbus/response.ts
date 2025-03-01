import { z } from 'zod';

export const pingRequestSchema = z.object({
    ip: z.string(),
    port: z.number(),
    modbusId: z.number(),
});

export const pingResponseSchema = z.object({
    time: z.string(),
    alive: z.boolean(),
});

export const readRegisterRequestSchema = z.object({
    ip: z.string().ip({
        version: 'v4'
    }),
    port: z.number(),
    modbusId: z.number(),
    register: z.number(),
    length: z.number(),
});

export const readRegisterResponseSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('ok'),
        time: z.number(),
        fields: z.array(z.object({
            register: z.number(),
            value: z.number(),
        })),
    }),
    z.object({
        status: z.literal('error'),
        message: z.string(),
    }),
]);

export const writeRegisterRequestSchema = z.object({
    ip: z.string().ip({
        version: 'v4'
    }),
    port: z.number().min(0).max(65535),
    modbusId: z.number(),
    register: z.number(),
    length: z.number(),
    data: z.array(z.number().min(0).max(65535)).min(1),
}).refine(data => data.length === data.data.length, {
    message: 'data length must match length',
});

export const writeRegisterResponseSchema = z.discriminatedUnion('status', [
    z.object({
        status: z.literal('ok'),
        time: z.number(),
    }),
    z.object({
        status: z.literal('error'),
        message: z.string(),
    }),
]);

export type PingRequestData = z.infer<typeof pingRequestSchema>;
export type PingResponseData = z.infer<typeof pingResponseSchema>;
export type ReadRegisterRequestData = z.infer<typeof readRegisterRequestSchema>;
export type ReadRegisterResponseData = z.infer<typeof readRegisterResponseSchema>;
export type WriteRegisterRequestData = z.infer<typeof writeRegisterRequestSchema>;
export type WriteRegisterResponseData = z.infer<typeof writeRegisterResponseSchema>;