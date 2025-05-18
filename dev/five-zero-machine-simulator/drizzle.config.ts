import env from "./src/env";
import { defineConfig } from "drizzle-kit";
export default defineConfig({
    dialect: "postgresql",
    schema: "./src/modules/db/schemas.ts",
    dbCredentials: {
        url: env.DRIZZLE_DATABASE_URL
    }
});