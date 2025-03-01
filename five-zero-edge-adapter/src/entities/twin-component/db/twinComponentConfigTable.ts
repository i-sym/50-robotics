import { integer, pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const twinComponentConfigTable = pgTable("twin_component_config", {
    id: serial('id').primaryKey(),
    name: text('name').notNull().default("N/A")
});

