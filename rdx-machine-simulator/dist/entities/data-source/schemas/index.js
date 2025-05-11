"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceConfigSchema = exports.dataSourceSchema = void 0;
const zod_1 = require("zod");
exports.dataSourceSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
exports.dataSourceConfigSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
//# sourceMappingURL=index.js.map