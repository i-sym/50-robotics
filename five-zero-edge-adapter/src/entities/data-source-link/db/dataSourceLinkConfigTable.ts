import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const dataSourceLinkConfigTable = pgTable("data_source_link_config", {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default("N/A")
});

