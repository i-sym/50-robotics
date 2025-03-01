import { z } from 'zod'
import { datapointConfigSchema, deviceSwitchingConfigSchema } from './details'

export const datapointValueSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('number'),
        value: z.number(),
        unit: z.string(),
    }),
    z.object({
        type: z.literal('enum'),
        value: z.string(),
    }),
    z.object({
        type: z.literal('string'),
        value: z.string(),
    }),
])

export const datapointSeriesSchema = z.object({
    datapointDescription: datapointConfigSchema,
    values: z.array(z.record(z.string(), z.union([z.number(), z.string()])))
})

export const previewChartSchema = z.object({
    lastUpdate: z.coerce.date(),
    data: z.object({
        sunElevation: datapointSeriesSchema.nullable(),
        price: datapointSeriesSchema.nullable(),
        status: datapointSeriesSchema.nullable(),
        power: datapointSeriesSchema.nullable()
    })
})

export type DatapointSeriesData = z.infer<typeof datapointSeriesSchema>
export type PreviewChartData = z.infer<typeof previewChartSchema>


export const pingabilitySchema = z.object({
    ping: z.boolean(),
})

export const inverterPreviewSchema = z.object({
    id: z.number(),
    name: z.string(),
    pingability: z.boolean(),
    lastUpdate: z.coerce.date(),
    datapoints: z.object({
        power: datapointValueSchema,
        status: datapointValueSchema,
        switchingMode: datapointValueSchema,
    }),
    switchingConfig: deviceSwitchingConfigSchema
})

export const plantPreviewSchema = z.object({
    id: z.number(),
    name: z.string(),
    location: z.string(),
    inverters: z.array(inverterPreviewSchema)
})

export type PlantPreviewData = z.infer<typeof plantPreviewSchema>
export type InverterPreviewData = z.infer<typeof inverterPreviewSchema>
export type DatapointValueData = z.infer<typeof datapointValueSchema>
export type PingabilityData = z.infer<typeof pingabilitySchema>