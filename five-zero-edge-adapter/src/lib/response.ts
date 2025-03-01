import { z } from "zod"

export function good(data: any): z.infer<typeof apiResponseSchema> {
    return ({
        success: true,
        data: data
    })
}

export function bad(data: any): z.infer<typeof apiResponseSchema> {
    return ({
        success: false,
        data: data
    })
}

export const apiResponseSchema = z.discriminatedUnion('success', [
    z.object({
        success: z.literal(true),
        data: z.any(),
    }),
    z.object({
        success: z.literal(false),
        data: z.any(),
    }),
])