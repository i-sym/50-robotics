"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceConfigTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.dataSourceConfigTable = (0, pg_core_1.pgTable)("data_source_config", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().default("N/A")
});
//# sourceMappingURL=dataSourceConfigTable.js.map