import { z } from 'zod'

export const dbPriceRecordSchema = z.object({
    id: z.number().optional(),
    priceInCents: z.number(),
    windowTimestamp: z.date(),
    fetchedAt: z.date()
})

export const priceRecordSchema = z.object({
    price: z.number().step(0.01),
    windowTimestamp: z.coerce.date(),
})

export type DbPriceRecordData = z.infer<typeof dbPriceRecordSchema>
export type PriceRecordData = z.infer<typeof priceRecordSchema>