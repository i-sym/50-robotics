"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plantSchema = exports.deviceSchema = exports.deviceSwitchingConfigSchema = exports.methodConfigSchema = exports.datapointConfigSchema = void 0;
const zod_1 = require("zod");
exports.datapointConfigSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    address: zod_1.z.number(),
    length: zod_1.z.number(),
    type: zod_1.z.enum(['number', 'string', 'enum']),
    unit: zod_1.z.string().optional(),
    multiplier: zod_1.z.number().optional(),
    enumValues: zod_1.z.array(zod_1.z.string()).optional()
});
exports.methodConfigSchema = zod_1.z.object({
    name: zod_1.z.string(),
    args: zod_1.z.array(zod_1.z.object({
        name: zod_1.z.string(),
        type: zod_1.z.enum(['number', 'string', 'enum']),
        enumValues: zod_1.z.array(zod_1.z.string()).optional()
    }))
});
exports.deviceSwitchingConfigSchema = zod_1.z.discriminatedUnion('mode', [
    zod_1.z.object({
        mode: zod_1.z.literal('manual'),
        target: zod_1.z.enum(['on', 'off']),
    }),
    zod_1.z.object({
        mode: zod_1.z.literal('auto'),
        priceThreshold: zod_1.z.coerce.number().step(0.01),
    })
]);
exports.deviceSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    switchingConfig: exports.deviceSwitchingConfigSchema,
    modbusConfig: zod_1.z.object({
        ip: zod_1.z.string(),
        port: zod_1.z.number(),
        modbusId: zod_1.z.number(),
    }),
    datapoints: zod_1.z.object({
        power: exports.datapointConfigSchema,
        status: exports.datapointConfigSchema,
        custom: zod_1.z.array(exports.datapointConfigSchema)
    }),
    methods: zod_1.z.object({
        switchOn: exports.methodConfigSchema,
        switchOff: exports.methodConfigSchema
    })
});
exports.plantSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    location: zod_1.z.string(),
    inverterIds: zod_1.z.array(zod_1.z.number())
});
//# sourceMappingURL=details.js.map