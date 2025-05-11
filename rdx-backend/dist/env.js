"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
(0, dotenv_1.configDotenv)();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum([
        'development',
        'test',
        'production',
    ], {
        description: 'This gets updated depending on your environment',
    }).default('development'),
    PORT: zod_1.z.coerce
        .number({
        description: '.env files convert numbers to strings, therefoore we have to enforce them to be numbers',
    })
        .positive()
        .max(65536, `options.port should be >= 0 and < 65536`)
        .default(3000),
    ALLOWED_API_KEY: zod_1.z.string(),
    DRIZZLE_DATABASE_URL: zod_1.z.string(),
});
const env = envSchema.parse(process.env);
exports.default = env;
//# sourceMappingURL=env.js.map