import { configDotenv } from 'dotenv';
import { z } from 'zod';

configDotenv();

const envSchema = z.object({
    NODE_ENV: z.enum(
        [
            'development',
            'test',
            'production',
        ],
        {
            description: 'This gets updated depending on your environment',
        }
    ).default('development'),
    PORT: z.coerce
        .number({
            description: '.env files convert numbers to strings, therefoore we have to enforce them to be numbers',
        })
        .positive()
        .max(65536, `options.port should be >= 0 and < 65536`)
        .default(3000),
    ALLOWED_API_KEY: z.string(),
    DRIZZLE_DATABASE_URL: z.string(),
});


const env = envSchema.parse(process.env);
export default env;