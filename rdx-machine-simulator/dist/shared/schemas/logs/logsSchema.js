"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recentLogsSchema = exports.logsSchema = void 0;
const zod_1 = require("zod");
exports.logsSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    timestamp: zod_1.z.coerce.date(),
    subsystem: zod_1.z.string(),
    message: zod_1.z.string(),
    level: zod_1.z.enum(['info', 'warning', 'error']),
});
exports.recentLogsSchema = zod_1.z.object({
    lastUpdate: zod_1.z.coerce.date(),
    logs: zod_1.z.array(exports.logsSchema)
});
//# sourceMappingURL=logsSchema.js.map