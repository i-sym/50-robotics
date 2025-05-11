"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceLinkDescriptionSchema = exports.dataSourceLinkConfigSchema = void 0;
const zod_1 = require("zod");
exports.dataSourceLinkConfigSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
exports.dataSourceLinkDescriptionSchema = zod_1.z.object({
    id: zod_1.z.number(),
    name: zod_1.z.string(),
    description: zod_1.z.string(),
    createdAt: zod_1.z.string(),
});
//# sourceMappingURL=index.js.map