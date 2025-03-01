"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwinComponentConfigTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.TwinComponentConfigTable = (0, pg_core_1.pgTable)("twin_component_config", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().default("N/A")
});
//# sourceMappingURL=twinComponentConfigTable.js.map