import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const dataSourceConfigTable = pgTable("data_source_config", {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default("N/A")
});

