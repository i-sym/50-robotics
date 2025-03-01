import { z } from 'zod'


export const datapointConfigSchema = z.object({
    id: z.number(),
    name: z.string(),
    address: z.number(),
    length: z.number(),
    type: z.enum(['number', 'string', 'enum']),
    unit: z.string().optional(),
    multiplier: z.number().optional(),
    enumValues: z.array(z.string()).optional()
})

export const methodConfigSchema = z.object({
    name: z.string(),
    args: z.array(z.object({
        name: z.string(),
        type: z.enum(['number', 'string', 'enum']),
        enumValues: z.array(z.string()).optional()
    }))
})

export const deviceSwitchingConfigSchema = z.discriminatedUnion('mode', [
    z.object({
        mode: z.literal('manual'),
        target: z.enum(['on', 'off']),
    }),
    z.object({
        mode: z.literal('auto'),
        priceThreshold: z.coerce.number().step(0.01),
    })
])

export type DeviceSwitchingConfigData = z.infer<typeof deviceSwitchingConfigSchema>

export const deviceSchema = z.object({
    id: z.number(),
    name: z.string(),
    switchingConfig: deviceSwitchingConfigSchema,
    modbusConfig: z.object({
        ip: z.string(),
        port: z.number(),
        modbusId: z.number(),
    }),

    datapoints: z.object({
        power: datapointConfigSchema,
        status: datapointConfigSchema,
        custom: z.array(datapointConfigSchema)
    }),

    methods: z.object({
        switchOn: methodConfigSchema,
        switchOff: methodConfigSchema
    })

})

export const plantSchema = z.object({
    id: z.number(),
    name: z.string(),
    location: z.string(),
    inverterIds: z.array(z.number())
})


export type DeviceData = z.infer<typeof deviceSchema>
export type PlantData = z.infer<typeof plantSchema>
export type DatapointConfigData = z.infer<typeof datapointConfigSchema>
export type MethodConfigData = z.infer<typeof methodConfigSchema>
