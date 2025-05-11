"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiResponseSchema = void 0;
exports.good = good;
exports.bad = bad;
const zod_1 = require("zod");
function good(data) {
    return ({
        success: true,
        data: data
    });
}
function bad(data) {
    return ({
        success: false,
        data: data
    });
}
exports.apiResponseSchema = zod_1.z.discriminatedUnion('success', [
    zod_1.z.object({
        success: zod_1.z.literal(true),
        data: zod_1.z.any(),
    }),
    zod_1.z.object({
        success: zod_1.z.literal(false),
        data: zod_1.z.any(),
    }),
]);
//# sourceMappingURL=response.js.map