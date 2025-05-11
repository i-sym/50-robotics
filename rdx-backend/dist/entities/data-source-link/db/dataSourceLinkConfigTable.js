"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataSourceLinkConfigTable = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.dataSourceLinkConfigTable = (0, pg_core_1.pgTable)("data_source_link_config", {
    id: (0, pg_core_1.integer)().primaryKey().generatedAlwaysAsIdentity(),
    name: (0, pg_core_1.varchar)({ length: 255 }).notNull().default("N/A")
});
//# sourceMappingURL=dataSourceLinkConfigTable.js.map