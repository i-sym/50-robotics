import { OpenAPIHono } from '@hono/zod-openapi';
import { Bindings } from '../common/types/Bindings';

/**
 * Setup OpenAPI documentation
 */
export function openApiSetup(app: OpenAPIHono<{ Bindings: Bindings }>) {
    // Set up OpenAPI document
    app.doc('/docs/openapi.json', {
        openapi: '3.0.0',
        info: {
            title: 'Five-Zero Industrial IoT Platform - Adapter API',
            version: '1.0.0',
            description: 'API for the adapter services in the Five-Zero Industrial IoT Platform'
        },
        servers: [
            {
                url: '/',
                description: 'Local server'
            }
        ]
    });
}