"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plantPreviewSchema = exports.inverterPreviewSchema = exports.pingabilitySchema = exports.previewChartSchema = exports.datapointSeriesSchema = exports.datapointValueSchema = void 0;
const zod_1 = require("zod");
const details_1 = require("./details");
exports.datapointValueSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        type: zod_1.z.literal('number'),
        value: zod_1.z.number(),
        unit: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('enum'),
        value: zod_1.z.string(),
    }),
    zod_1.z.object({
        type: zod_1.z.literal('string'),
        value: zod_1.z.string(),
    }),
]);
exports.datapointSeriesSchema = zod_1.z.object({
    datapointDescription: details_1.datapointConfigSchema,
    values: zod_1.z.array(zod_1.z.record(zod_1.z.string(), zod_1.z.union([zod_1.z.number(), zod_1.z.string()])))
});
exports.previewChartSchema = zod_1.z.object({
    lastUpdate: zod_1.z.coerce.date(),
    data: zod_1.z.object({
        sunElevation: exports.datapointSeriesSchema.nullable(),
        price: exports.datapointSeriesSchema.nullable(),
        status: exports.datapointSeriesSchema.nullable(),
        power: exports.datapointSeriesSchema.nullable()
    })
});
exports.pingabilitySchema = zod_1.z.object({
    ping: zod_1.z.boolean(),
});
exports.inverterPreviewSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    pingability: zod_1.z.boolean(),
    lastUpdate: zod_1.z.coerce.date(),
    datapoints: zod_1.z.object({
        power: exports.datapointValueSchema,
        status: exports.datapointValueSchema,
        switchingMode: exports.datapointValueSchema,
    }),
    switchingConfig: details_1.deviceSwitchingConfigSchema
});
exports.plantPreviewSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    location: zod_1.z.string(),
    inverters: zod_1.z.array(exports.inverterPreviewSchema)
});
//# sourceMappingURL=preview.js.map