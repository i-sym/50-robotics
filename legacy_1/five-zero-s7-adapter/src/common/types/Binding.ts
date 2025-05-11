
import { OpenAPIHono } from '@hono/zod-openapi';

/**
 * Environment bindings type for Hono app
 */
export type Bindings = {
    user?: {
        id: string;
        name: string;
        email: string;
        roles: string[];
    };
};

export type ServiceAPI = OpenAPIHono<{
    Bindings: Bindings;
}>;
