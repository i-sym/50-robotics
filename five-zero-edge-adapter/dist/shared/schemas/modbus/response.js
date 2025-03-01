"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeRegisterResponseSchema = exports.writeRegisterRequestSchema = exports.readRegisterResponseSchema = exports.readRegisterRequestSchema = exports.pingResponseSchema = exports.pingRequestSchema = void 0;
const zod_1 = require("zod");
exports.pingRequestSchema = zod_1.z.object({
    ip: zod_1.z.string(),
    port: zod_1.z.number(),
    modbusId: zod_1.z.number(),
});
exports.pingResponseSchema = zod_1.z.object({
    time: zod_1.z.string(),
    alive: zod_1.z.boolean(),
});
exports.readRegisterRequestSchema = zod_1.z.object({
    ip: zod_1.z.string().ip({
        version: 'v4'
    }),
    port: zod_1.z.number(),
    modbusId: zod_1.z.number(),
    register: zod_1.z.number(),
    length: zod_1.z.number(),
});
exports.readRegisterResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({
        status: zod_1.z.literal('ok'),
        time: zod_1.z.number(),
        fields: zod_1.z.array(zod_1.z.object({
            register: zod_1.z.number(),
            value: zod_1.z.number(),
        })),
    }),
    zod_1.z.object({
        status: zod_1.z.literal('error'),
        message: zod_1.z.string(),
    }),
]);
exports.writeRegisterRequestSchema = zod_1.z.object({
    ip: zod_1.z.string().ip({
        version: 'v4'
    }),
    port: zod_1.z.number().min(0).max(65535),
    modbusId: zod_1.z.number(),
    register: zod_1.z.number(),
    length: zod_1.z.number(),
    data: zod_1.z.array(zod_1.z.number().min(0).max(65535)).min(1),
}).refine(data => data.length === data.data.length, {
    message: 'data length must match length',
});
exports.writeRegisterResponseSchema = zod_1.z.discriminatedUnion('status', [
    zod_1.z.object({
        status: zod_1.z.literal('ok'),
        time: zod_1.z.number(),
    }),
    zod_1.z.object({
        status: zod_1.z.literal('error'),
        message: zod_1.z.string(),
    }),
]);
//# sourceMappingURL=response.js.map