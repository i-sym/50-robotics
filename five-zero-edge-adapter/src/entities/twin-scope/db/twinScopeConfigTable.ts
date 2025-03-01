import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const twinScopeConfigTable = pgTable("twin_scope_config", {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default("N/A")
});

