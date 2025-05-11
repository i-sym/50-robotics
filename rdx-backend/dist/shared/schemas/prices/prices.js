"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceRecordSchema = exports.dbPriceRecordSchema = void 0;
const zod_1 = require("zod");
exports.dbPriceRecordSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    priceInCents: zod_1.z.number(),
    windowTimestamp: zod_1.z.date(),
    fetchedAt: zod_1.z.date()
});
exports.priceRecordSchema = zod_1.z.object({
    price: zod_1.z.number().step(0.01),
    windowTimestamp: zod_1.z.coerce.date(),
});
//# sourceMappingURL=prices.js.map